import { Client, DiscordAPIError, Message, Permissions, TextChannel, User } from 'discord.js';
import { Language } from 'klasa';
import { Events } from '../../types/Enums';
import { CONNECT_FOUR } from '../constants';
import { LLRCData, LLRCDataEmoji, LongLivingReactionCollector, LongLivingReactionCollectorListener } from '../LongLivingReactionCollector';
import { resolveEmoji } from '../util';
import { ConnectFourManager } from './ConnectFourManager';

interface ConnectFourWinningRowElement {
	x: number;
	y: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ConnectFourWinningRow extends Array<ConnectFourWinningRowElement> {}

export class ConnectFour {

	/**
	 * The Client that manages this instance
	 */
	public client: Client;

	/**
	 * The challenger of the game
	 */
	public challenger: User;

	/**
	 * The challengee of the game
	 */
	public challengee: User;

	/**
	 * The Message used for the game
	 */
	public message: Message = null;

	/**
	 * The current turn
	 */
	public turn = Math.round(Math.random());

	/**
	 * The table game
	 */
	public table = [
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0]
	];

	/**
	 * The winner of the game
	 */
	public winner: User = null;

	/**
	 * The callback that holds the collector
	 */
	public collector: LongLivingReactionCollectorListener = null;

	/**
	 * The LongLivingReactionCollector instance
	 */
	public llrc: LongLivingReactionCollector = null;

	/**
	 * Whether this instance is running or not
	 */
	public running = false;

	/**
	 * The Language used for the game's internacionalization
	 */
	public get language(): Language {
		return this.message.language;
	}

	public constructor(challenger: User, challengee: User) {
		this.client = challenger.client;
		this.challenger = challenger;
		this.challengee = challengee;
	}

	/**
	 * Get the ConnectFourManager instance that manages this
	 */
	public get manager(): ConnectFourManager {
		return this.client.connectFour;
	}

	/**
	 * Whether Skyra has the MANAGE_MESSAGES permission or not
	 */
	public get manageMessages(): boolean {
		return (this.message.channel as TextChannel).permissionsFor(this.message.guild.me).has(Permissions.FLAGS.MANAGE_MESSAGES);
	}

	/**
	 * Run the ConnectFour game
	 * @param message The Message that runs this game
	 */
	public async run(message: Message): Promise<void> {
		if (this.running) return;
		this.llrc = new LongLivingReactionCollector(this.client, this.send.bind(this), this.gameTimeout.bind(this));
		this.llrc.setTime(120000);
		this.running = true;

		// @ts-ignore
		this.language = message.language;
		// @ts-ignore
		this.message = await message.edit(this.language.get('SYSTEM_LOADING'));
		for (const reaction of CONNECT_FOUR.REACTIONS) await this.message.react(reaction);
		await this.render();

		while (this.running) {
			let row;
			try {
				if (this.isFullGame()) throw CONNECT_FOUR.RESPONSES.FULL_GAME;
				row = await this.getRow();
				if (!row) this.switch();
				await this.render();
			} catch (error) {
				if (error === CONNECT_FOUR.RESPONSES.FULL_LINE) {
					await this.render(error);
				} else if (error === CONNECT_FOUR.RESPONSES.FULL_GAME) {
					await this.gameFullLine();
					break;
				} else if (error === CONNECT_FOUR.RESPONSES.TIMEOUT) {
					await this.gameTimeout();
					break;
				} else if (error && error.code === 10008) {
					this.gameLostMessage();
					break;
				} else {
					if (this.message) this.client.emit(Events.CommandError, this.message, this.client.commands.get('c4'), [this.challengee], error);
					else this.client.emit(Events.Wtf, error);
					break;
				}
			}

			if (row) break;
		}
	}

	public async gameFullLine() {
		await this.gameDraw();
	}

	public async gameDraw() {
		await this.message.edit(this.language.get('COMMAND_C4_GAME_DRAW', this.renderTable()));
		if (this.manageMessages) await this.message.reactions.removeAll().catch(err => this.client.emit(Events.ApiError, err));
	}

	public async gameTimeout() {
		await this.message.edit(this.language.get('COMMAND_GAMES_TIMEOUT'));
		this.llrc.end();
	}

	public gameLostMessage(): void {
		this.manager.delete(this.message.channel.id);
		this.llrc.end();
	}

	/**
	 * Show the winner and clear reactions
	 * @param row The winning row
	 */
	public showWinner(row: ConnectFourWinningRow): void {
		this.winner = this.turn === 0 ? this.challenger : this.challengee;
		const VALUE = this.turn === 0 ? 'WINNER_1' : 'WINNER_2';
		// @ts-ignore
		for (const { x, y } of row) this.table[x][y] = VALUE;
		if (this.manageMessages) this.message.reactions.removeAll().catch(error => this.client.emit(Events.ApiError, error));
		this.llrc.end();
	}

	/**
	 * Get a row from the current player
	 */
	public async getRow(): Promise<ConnectFourWinningRow | null> {
		const PLAYER = (this.turn === 0 ? this.challenger : this.challengee).id;
		const reaction = await new Promise<string>((resolve, reject) => {
			this.llrc.setTime(120000);
			this.llrc.setEndListener(reject);
			this.collector = data => {
				if (data.userID === PLAYER && CONNECT_FOUR.REACTIONS.includes(data.emoji.name)) {
					if (this.manageMessages) {
						this.removeEmoji(data.emoji, data.userID)
							.catch(error => this.client.emit(Events.ApiError, error));
					}
					resolve(data.emoji.name);
				}
			};
		});
		return this.pushLine(CONNECT_FOUR.REACTIONS.indexOf(reaction));
	}

	/**
	 * Push a new disk to a column
	 * @param row The row to push
	 */
	public pushLine(row: number): ConnectFourWinningRow {
		if (this.isFullLine(row)) throw CONNECT_FOUR.RESPONSES.FULL_LINE;

		const column = this.table[row];
		for (let y = 0; y < column.length; y++) {
			if (column[y] === 0) {
				column[y] = this.turn + 1;
				return this.check(row, y);
			}
		}
		return null;
	}

	/**
	 * Check whether the game has all the lines full
	 */
	public isFullGame(): boolean {
		for (let x = 0; x < this.table.length; x++) {
			if (!this.isFullLine(x)) return false;
		}

		return true;
	}

	/**
	 * Check whether the line is full
	 * @param row The row to check
	 */
	public isFullLine(row: number): boolean {
		return this.table[row][5] !== 0;
	}

	/**
	 * Check if there's a winning row.
	 * @param posX The position X to check
	 * @param posY The position Y to check
	 */
	public check(posX: number, posY: number): ConnectFourWinningRow {
		const row = this._check(posX, posY);
		if (row) this.showWinner(row);
		return row;
	}

	/**
	 * Render the current table and add a head
	 * @param error The error number
	 */
	public render(error?: number): Promise<Message> {
		// @ts-ignore
		return this.message.edit((error === CONNECT_FOUR.RESPONSES.FULL_LINE ? this.language.get('COMMAND_C4_GAME_COLUMN_FULL') : '')
			+ this.language.get(
				this.winner ? 'COMMAND_C4_GAME_WIN' : 'COMMAND_C4_GAME_NEXT',
				this.turn === 0 ? this.challenger.username : this.challengee.username,
				this.turn,
				this.renderTable()
			));
	}

	/**
	 * Render the current table
	 */
	public renderTable() {
		const MAX_LENGTH = this.table.length;

		let output = '';
		for (let y = 5; y >= 0; y--) {
			for (let x = 0; x < MAX_LENGTH; x++) output += `${CONNECT_FOUR.EMOJIS[this.table[x][y]]}       `;
			output += '\n';
		}
		return output;
	}

	/**
	 * Switch the current turn
	 */
	public switch(): void {
		this.turn = this.turn ? 0 : 1;
	}

	/**
	 * Send a reaction to the internal handler
	 * @param reaction The emoji
	 */
	public send(reaction: LLRCData): void {
		if (this.collector) this.collector(reaction);
	}

	/**
	 * Remove an emoji from a message
	 * @param emoji The emoji to remove
	 * @param userID The user ID that reacted to the message
	 */
	public async removeEmoji(emoji: string | LLRCDataEmoji, userID: string): Promise<void> {
		try {
			// @ts-ignore
			await this.client.api.channels[this.message.channel.id].messages[this.message.id]
				.reactions[resolveEmoji(emoji)][userID].delete();
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				// Unknown Message | Unknown Emoji
				if (error.code === 10008 || error.code === 10014) return;
			}

			this.client.emit(Events.ApiError, error);
		}
	}

	/**
	 * Free memory by nully-ing all properties
	 */
	public dispose(): void {
		this.challenger = null;
		this.challengee = null;
		this.message = null;
		this.turn = null;
		this.table = null;
		this.winner = null;
		this.running = false;
	}

	/**
	 * Check if there's a winning row.
	 * @param posX The position X to check
	 * @param posY The position Y to check
	 */
	private _check(posX: number, posY: number): ConnectFourWinningRow {
		const PLAYER = this.turn + 1;
		const MIN_X = Math.max(0, posX - 3);
		const MIN_Y = Math.max(0, posY - 3);
		const MAX_X = Math.min(6, posX + 3);
		const MAX_Y = Math.min(5, posY + 3);

		// @ts-ignore
		const verticals = this._checkVerticals(posX, MIN_Y, MAX_Y, PLAYER);
		if (verticals) return verticals;

		let diagUp = 0;
		let diagDown = 0;
		let horizontal = 0;
		for (let offset = MIN_X - posX; offset <= MAX_X - posX; offset++) {
			const x = posX + offset;
			const tableX = this.table[x];

			// Check horizontals
			if (tableX[posY] === PLAYER) {
				horizontal++;
				if (horizontal === 5) {
					return [
						{ x: x - 3, y: posY },
						{ x: x - 2, y: posY },
						{ x: x - 1, y: posY },
						{ x, y: posY }
					];
				}
			} else { horizontal = 0; }

			// Check diagonals up
			const upY = posY + offset;
			if (MIN_Y <= upY && upY <= MAX_Y) {
				if (tableX[upY] === PLAYER) {
					diagUp++;
					if (diagUp === 5) {
						return [
							{ x: x - 3, y: upY - 3 },
							{ x: x - 2, y: upY - 2 },
							{ x: x - 1, y: upY - 1 },
							{ x, y: upY }
						];
					}
				} else { diagUp = 0; }
			}

			// Check diagonals down
			const downY = posY - offset;
			if (MIN_Y <= downY && downY <= MAX_Y) {
				if (tableX[downY] === PLAYER) {
					diagDown++;
					if (diagDown === 5) {
						return [
							{ x: x - 3, y: downY + 3 },
							{ x: x - 2, y: downY + 2 },
							{ x: x - 1, y: downY + 1 },
							{ x, y: downY }
						];
					}
				} else { diagDown = 0; }
			}
		}

		return null;
	}

	/**
	 * Check if there's a winning vertical row
	 * @param posX The current X position
	 * @param MIN_Y The minimum Y position
	 * @param MAX_Y The maximum Y position
	 * @param PLAYER The current player
	 */
	private _checkVerticals(posX: number, MIN_Y: number, MAX_Y: number, PLAYER: number): ConnectFourWinningRow | null {
		let verticals = 0;
		let y: number;
		for (y = MIN_Y; y < MAX_Y; y++) {
			const row = this.table[posX][y];
			if (row === PLAYER) {
				verticals++;
				if (verticals === 5) break;
			} else {
				verticals = 0;
			}
		}

		if (verticals === 5) {
			return [
				{ x: posX, y: y - 3 },
				{ x: posX, y: y - 2 },
				{ x: posX, y: y - 1 },
				{ x: posX, y }
			];
		}

		return null;
	}

}
