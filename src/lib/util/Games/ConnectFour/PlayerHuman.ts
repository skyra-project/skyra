import { Game } from './Game';
import { Player, PlayerColor } from './Player';
import { KlasaUser } from 'klasa';
import { Cell } from './Board';
import { LLRCDataEmoji } from '../../LongLivingReactionCollector';
import { CONNECT_FOUR } from '../../constants';
import { DiscordAPIError } from 'discord.js';
import { Events } from '../../../types/Enums';
import { resolveEmoji } from '../../util';

export class PlayerHuman extends Player {

	private player: KlasaUser;

	public constructor(game: Game, cell: Cell, winning: Cell, color: PlayerColor, player: KlasaUser) {
		super(game, cell, winning, color, player.username);
		this.player = player;
	}

	public async start() {
		const reaction = await new Promise<string>(resolve => {
			this.game.llrc.setTime(60000);
			this.game.llrc.setEndListener(() => resolve(''));
			this.game.llrc.setListener(data => {
				if (data.userID === this.player.id && CONNECT_FOUR.REACTIONS.includes(data.emoji.name)) {
					if (this.game.manageMessages) {
						this.removeEmoji(data.emoji, data.userID)
							.catch(error => this.game.message.client.emit(Events.ApiError, error));
					}
					resolve(data.emoji.name);
				}
			});
		});

		if (!reaction) {
			this.game.content = this.game.language.get('COMMAND_GAMES_TIMEOUT');
			this.game.stop();
		} else if (!this.drop(CONNECT_FOUR.REACTIONS.indexOf(reaction))) {
			return this.start();
		}
	}

	public finish() {
		super.finish();
		this.game.llrc.setTime(-1);
		this.game.llrc.setListener(null);
	}

	private async removeEmoji(emoji: LLRCDataEmoji, userID: string): Promise<void> {
		try {
			const message = this.game.message;
			// @ts-ignore
			await message.client.api.channels[message.channel.id].messages[message.id]
				.reactions[resolveEmoji(emoji)][userID].delete();
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				// Unknown Message | Unknown Emoji
				if (error.code === 10008 || error.code === 10014) return;
			}

			this.game.message.client.emit(Events.ApiError, error);
		}
	}

}
