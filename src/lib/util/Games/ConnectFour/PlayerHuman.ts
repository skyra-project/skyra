import { Events } from '@lib/types/Enums';
import { APIErrors, ConnectFourConstants, Time } from '@utils/constants';
import { LLRCDataEmoji } from '@utils/LongLivingReactionCollector';
import { api } from '@utils/Models/Api';
import { resolveEmoji } from '@utils/util';
import { DiscordAPIError } from 'discord.js';
import { KlasaUser } from 'klasa';
import { Cell } from './Board';
import { Game } from './Game';
import { Player, PlayerColor } from './Player';

export class PlayerHuman extends Player {

	private player: KlasaUser;

	public constructor(game: Game, cell: Cell, winning: Cell, color: PlayerColor, player: KlasaUser) {
		super(game, cell, winning, color, player.username);
		this.player = player;
	}

	public async start(): Promise<void> {
		const reaction = await new Promise<string>(resolve => {
			this.game.llrc?.setTime(Time.Minute * 5);
			this.game.llrc?.setEndListener(() => resolve(''));
			this.game.llrc?.setListener(data => {
				if (data.userID === this.player.id && ConnectFourConstants.Reactions.includes(data.emoji.name)) {
					if (this.game.manageMessages) {
						this.removeEmoji(data.emoji, data.userID)
							.catch(error => this.game.message.client.emit(Events.ApiError, error));
					}
					resolve(data.emoji.name);
				}
			});
		});

		if (this.game.stopped) return;
		if (!reaction) {
			this.game.content = this.game.language.tget('COMMAND_GAMES_TIMEOUT');
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
			await api(message.client).channels(message.channel.id).messages(message.id)
				.reactions(resolveEmoji(emoji)!)(userID).delete();
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === APIErrors.UnknownMessage || error.code === APIErrors.UnknownEmoji) return;
			}

			this.game.message.client.emit(Events.ApiError, error);
		}
	}

}
