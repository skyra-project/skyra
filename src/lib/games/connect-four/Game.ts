import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types/Enums';
import { ConnectFourConstants } from '#utils/constants';
import { LongLivingReactionCollector } from '#utils/LongLivingReactionCollector';
import { floatPromise, pickRandom } from '#utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { DiscordAPIError, Message, Permissions, TextChannel } from 'discord.js';
import { TFunction } from 'i18next';
import { Board } from './Board';
import { Player, PlayerColor } from './Player';

export class Game {
	public readonly board: Board;
	public message: Message;
	public t: TFunction = null!;
	public players: readonly [Player | null, Player | null];
	public winner: Player | null;
	public llrc: LongLivingReactionCollector | null;
	public stopped = false;
	private _turnLeft: boolean = Math.round(Math.random()) === 0;
	private _content = '';
	private _retries = 3;

	public constructor(message: Message) {
		this.board = new Board();
		this.message = message;
		this.players = [null, null];
		this.winner = null;
		this.llrc = null;
	}

	public setPlayers(players: [Player, Player]) {
		this.players = players;
	}

	public set content(value: string) {
		this._content = value;
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		floatPromise(this.message, this.updateContent());
	}

	public get content() {
		return this._content;
	}

	public get next() {
		return this.players[this._turnLeft ? 1 : 0];
	}

	public get running() {
		return !this.winner && !this.stopped;
	}

	/**
	 * Whether Skyra has the MANAGE_MESSAGES permission or not
	 */
	public get manageMessages(): boolean {
		const { message } = this;
		return (message.channel as TextChannel).permissionsFor(message.guild!.me!)!.has(Permissions.FLAGS.MANAGE_MESSAGES);
	}

	public stop() {
		this.stopped = true;
		if (this.llrc?.endListener) this.llrc.endListener();
	}

	public async run() {
		this.t = await this.message.fetchT();
		this.message = await this.message.send(pickRandom(this.t(LanguageKeys.System.Loading)));
		for (const reaction of ConnectFourConstants.Reactions) await this.message.react(reaction);
		this.content = this.t(
			this.next!.color === PlayerColor.Blue ? LanguageKeys.Commands.Games.C4GameNextTurn0 : LanguageKeys.Commands.Games.C4GameNext,
			{
				user: this.next!.name
			}
		);
		this.llrc = new LongLivingReactionCollector(this.message.client);

		let stop = false;
		while (!stop) {
			const player = this.next;
			await player!.start();
			if (!(stop = !this.running)) this._turnLeft = !this._turnLeft;
			await player!.finish();
		}

		if (!this.message.deleted && this.manageMessages) {
			await this.message.reactions.removeAll().catch((err) => this.message.client.emit(Events.ApiError, err));
		}
	}

	private async updateContent() {
		try {
			await this.message.edit(`${this.content}\n${this.board.render()}`);
			this._retries = 3;
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				(error.code === RESTJSONErrorCodes.UnknownChannel || error.code === RESTJSONErrorCodes.UnknownMessage)
			) {
				if (error.code !== RESTJSONErrorCodes.UnknownChannel) await this.message.alert(this.t(LanguageKeys.Commands.Games.C4GameDraw));
				this.stop();
			} else {
				this.message.client.emit(Events.Wtf, error);
				if (--this._retries === 0) return this.stop();
			}
		}
	}
}
