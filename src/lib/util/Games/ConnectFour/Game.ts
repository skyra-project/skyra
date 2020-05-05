import { Events } from '@lib/types/Enums';
import { APIErrors, ConnectFourConstants } from '@utils/constants';
import { LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import { floatPromise } from '@utils/util';
import { DiscordAPIError, Permissions, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { Board } from './Board';
import { Player } from './Player';

export class Game {

	public readonly board: Board;
	public message: KlasaMessage;
	public players: readonly [Player | null, Player | null];
	public winner: Player | null;
	public llrc: LongLivingReactionCollector | null;
	public stopped = false;
	private _turnLeft: boolean = Math.round(Math.random()) === 0;
	private _content = '';
	private _retries = 3;

	public constructor(message: KlasaMessage) {
		this.board = new Board();
		this.message = message;
		this.players = [null, null];
		this.winner = null;
		this.llrc = null;
	}

	public setPlayers(players: [Player, Player]) {
		this.players = players;
	}

	public get language() {
		return this.message.language;
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
		this.message = await this.message.send(this.language.tget('SYSTEM_LOADING'));
		for (const reaction of ConnectFourConstants.Reactions) await this.message.react(reaction);
		this.content = this.language.tget('COMMAND_C4_GAME_NEXT', this.next!.name, this.next!.color);
		this.llrc = new LongLivingReactionCollector(this.message.client);

		let stop = false;
		while (!stop) {
			const player = this.next;
			await player!.start();
			if (!(stop = !this.running)) this._turnLeft = !this._turnLeft;
			await player!.finish();
		}

		if (!this.message.deleted && this.manageMessages) {
			await this.message.reactions.removeAll().catch(err => this.message.client.emit(Events.ApiError, err));
		}
	}

	private async updateContent() {
		try {
			await this.message.edit(`${this.content}\n${this.board.render()}`);
			this._retries = 3;
		} catch (error) {
			if (error instanceof DiscordAPIError && (error.code === APIErrors.UnknownChannel || error.code === APIErrors.UnknownMessage)) {
				if (error.code !== APIErrors.UnknownChannel) await this.message.alert(this.message.language.tget('COMMAND_C4_GAME_DRAW'));
				this.stop();
			} else {
				this.message.client.emit(Events.Wtf, error);
				if (--this._retries === 0) return this.stop();
			}
		}
	}

}
