import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Time } from '#utils/constants';
import type { Message } from 'discord.js';
import { BaseController } from '../base/BaseController';
import { GameStatus } from '../base/BaseGame';
import { BaseReactionGame } from '../base/BaseReactionGame';

export class TicTacToeGame extends BaseReactionGame<number> {
	public readonly board = new Uint8Array(9);

	public constructor(message: Message, playerA: BaseController<number>, playerB: BaseController<number>, turn = TicTacToeGame.getTurn()) {
		super(message, playerA, playerB, TicTacToeGame.kEmojis, Time.Minute * 5, turn);
	}

	public get finished() {
		return super.finished || this.board.every((cell) => cell !== 0) || this.check() !== null;
	}

	protected handle(value: number, player: BaseController<number>): void {
		if (value !== -1) this.board[value] = player.turn + 1;
	}

	protected render(status: GameStatus): string {
		return status === GameStatus.End ? this.renderOnEnd() : this.renderOnUpdateOrStart();
	}

	protected renderOnEnd() {
		const winner = this.check();
		return winner === null
			? this.language.get(LanguageKeys.Commands.Games.TicTacToeDraw, { board: this.renderBoard() })
			: this.language.get(LanguageKeys.Commands.Games.TicTacToeWinner, {
					winner: this.player.name,
					board: this.renderBoard()
			  });
	}

	protected renderOnUpdateOrStart(): string {
		return this.language.get(LanguageKeys.Commands.Games.TicTacToeTurn, {
			icon: TicTacToeGame.kPlayer[this.turn],
			player: this.player.name,
			board: this.renderBoard()
		});
	}

	protected renderBoard(): string {
		return `${this.renderRow(0)}\n${this.renderRow(1)}\n${this.renderRow(2)}`;
	}

	protected renderRow(row: number): string {
		const offset = row * 3;
		return `${this.renderCell(offset)}${this.renderCell(offset + 1)}${this.renderCell(offset + 2)}`;
	}

	protected renderCell(cell: number): string {
		const value = this.board[cell];
		return value === 0 ? TicTacToeGame.kEmojis[cell] : TicTacToeGame.kPlayer[value - 1];
	}

	private equals(a: number, b: number, c: number): boolean {
		return a === b && b === c;
	}

	private check(): number | null {
		// 0 1 2
		// 3 4 5
		// 6 7 8

		let a = 0;

		// Check rows
		for (let i = 0; i < 9; i += 3) {
			a = this.board[i];
			if (a !== 0 && this.equals(a, this.board[i + 1], this.board[i + 2])) return a;
		}

		// Check columns
		for (let i = 0; i < 3; ++i) {
			a = this.board[i];
			if (a !== 0 && this.equals(a, this.board[i + 3], this.board[i + 6])) return a;
		}

		// Check descending diagonal
		// eslint-disable-next-line prefer-destructuring
		a = this.board[0];
		if (a !== 0 && this.equals(a, this.board[4], this.board[8])) return a;

		// Check ascending diagonal
		// eslint-disable-next-line prefer-destructuring
		a = this.board[6];
		if (a !== 0 && this.equals(a, this.board[4], this.board[2])) return a;

		return null;
	}

	private static readonly kEmojis: readonly string[] = ['↖', '⬆', '↗', '⬅', '⏺', '➡', '↙', '⬇', '↘'];
	private static readonly kPlayer: readonly string[] = ['⭕', '❌'];
}
