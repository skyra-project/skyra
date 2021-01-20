import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types/Enums';
import { ConnectFourConstants, Time } from '#utils/constants';
import type { LLRCDataEmoji } from '#utils/LongLivingReactionCollector';
import { resolveEmoji } from '#utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, User } from 'discord.js';
import type { Cell } from './Board';
import type { Game } from './Game';
import { Player, PlayerColor } from './Player';

export class PlayerHuman extends Player {
	private player: User;

	public constructor(game: Game, cell: Cell, winning: Cell, color: PlayerColor, player: User) {
		super(game, cell, winning, color, player.username);
		this.player = player;
	}

	public async start(): Promise<void> {
		const reaction = await new Promise<string>((resolve) => {
			this.game.llrc?.setTime(Time.Minute * 5);
			this.game.llrc?.setEndListener(() => resolve(''));
			this.game.llrc?.setListener((data) => {
				const reactionID = data.emoji.id ?? data.emoji.name!;
				if (data.userID === this.player.id && ConnectFourConstants.Reactions.includes(reactionID)) {
					if (this.game.manageMessages) {
						this.removeEmoji(data.emoji, data.userID).catch((error) => this.game.message.client.emit(Events.ApiError, error));
					}
					resolve(reactionID);
				}
			});
		});

		if (this.game.stopped) return;
		if (!reaction) {
			this.game.content = this.game.t(LanguageKeys.Commands.Games.GamesTimeout);
			this.game.stop();
		} else if (!this.drop(ConnectFourConstants.Reactions.indexOf(reaction))) {
			return this.start();
		}
	}

	public async finish() {
		await super.finish();
		this.game.llrc?.setTime(-1);
		this.game.llrc?.setListener(null);
	}

	private async removeEmoji(emoji: LLRCDataEmoji, userID: string): Promise<void> {
		try {
			const { message } = this.game;
			await api().channels(message.channel.id).messages(message.id).reactions(resolveEmoji(emoji)!)(userID).delete();
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === RESTJSONErrorCodes.UnknownMessage || error.code === RESTJSONErrorCodes.UnknownEmoji) return;
			}

			this.game.message.client.emit(Events.ApiError, error);
		}
	}
}
