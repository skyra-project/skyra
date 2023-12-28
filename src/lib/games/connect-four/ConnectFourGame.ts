import type { BaseController } from '#lib/games/base/BaseController';
import { GameStatus } from '#lib/games/base/BaseGame';
import { BaseReactionGame } from '#lib/games/base/BaseReactionGame';
import { Emojis } from '#lib/games/connect-four/lib/constants';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { minutes } from '#utils/common';
import type { SerializedEmoji } from '#utils/functions';
import type { Message } from 'discord.js';

export enum Cell {
	Empty,
	PlayerOne,
	PlayerTwo,
	WinnerPlayerOne,
	WinnerPlayerTwo
}

export const columns = 7;
export const rows = 6;
const renderMargin = ' '.repeat(7);

export class ConnectFourGame extends BaseReactionGame<number> {
	public readonly board = new Uint8Array(columns * rows);
	public readonly remaining = new Uint8Array(columns).fill(rows);
	private winner: readonly [number, number][] | null = null;

	public constructor(message: Message, playerA: BaseController<number>, playerB: BaseController<number>, turn = ConnectFourGame.getTurn()) {
		super(message, playerA, playerB, ConnectFourGame.emojis, minutes(5), turn);
	}

	public override get finished() {
		return super.finished || this.winner !== null || this.isTableFull();
	}

	protected handle(value: number, player: BaseController<number>): void {
		if (value !== -1) {
			const y = --this.remaining[value];
			this.setAt(value, y, player.turn + 1);
			this.winner = this.check(value, y);
			if (this.winner !== null) {
				// + 1 is used to show the color, + 2 is used to show the winner
				const cell = player.turn + 3;
				for (const [x, y] of this.winner) {
					this.setAt(x, y, cell);
				}
			}
		}
	}

	protected render(status: GameStatus): string {
		return status === GameStatus.End ? this.renderOnEnd() : this.renderOnUpdateOrStart();
	}

	protected renderOnEnd() {
		return this.winner === null
			? this.t(LanguageKeys.Commands.Games.TicTacToeDraw, { board: this.renderBoard() })
			: this.t(LanguageKeys.Commands.Games.TicTacToeWinner, {
					winner: this.player.name,
					board: this.renderBoard()
				});
	}

	protected renderOnUpdateOrStart(): string {
		return this.t(LanguageKeys.Commands.Games.TicTacToeTurn, {
			icon: ConnectFourGame.players[this.turn],
			player: this.player.name,
			board: this.renderBoard()
		});
	}

	protected renderBoard(): string {
		const output: string[] = [];
		for (let y = 0; y < rows; ++y) {
			// Render each line
			const line: string[] = [];
			for (let x = 0; x < columns; ++x) {
				line.push(ConnectFourGame.renderCell(this.getAt(x, y)));
			}
			output.push(line.join(renderMargin));
		}

		return output.join('\n');
	}

	private setAt(x: number, y: number, value: Cell) {
		const cell = x + y * columns;
		this.board[cell] = value;
	}

	private getAt(x: number, y: number) {
		const cell = x + y * columns;
		return this.board[cell];
	}

	private check(x: number, y: number): readonly [number, number][] | null {
		const cell = this.getAt(x, y);

		return (
			this.checkVertical(x, y, cell) ||
			this.checkHorizontal(x, y, cell) ||
			this.checkDiagonalTopLeftToBottomRight(x, y, cell) ||
			this.checkDiagonalBottomLeftToTopRight(x, y, cell)
		);
	}

	private isTableFull() {
		return this.remaining.every((value) => value === 0);
	}

	private checkHorizontal(x: number, y: number, cell: Cell) {
		/**
		 * 00__ 10__ 20__ 30__ 40__ 50__ 60__
		 * 01__ 11__ 21__ 31__ 41__ 51__ 61__
		 * 02__ 12__ 22__ 32__ 42__ 52__ 62__
		 * 03__ 13__ 23__ 33__ 43__ 53__ 63__
		 * 04__ 14__ 24_o 34_o 44_o 54__ 64__
		 * 05__ 15__ 25_x 35_x 45_x 55_x 65__
		 *
		 * Winning: { 25, 35, 45, 55 }
		 * Assuming last move as 55.
		 *
		 * We retrieve the corner for this move:
		 * lx = x - 3
		 * rx = x + 3
		 *
		 * We iterate from { lx, y } to { rx, y } inclusive, increasing lx by 1.
		 *
		 * We will also optimize one case: since this is linear, we don't need to iterate from x - 3 to x + 3, but
		 * instead, we will iterate from max(x - 3, 0), skipping negatives, to min(x + 3, kColumns - 1), this shortens
		 * the range from [-3..8] to [0..6].
		 */

		let count = 0;
		const rx = Math.min(x + 3, columns - 1);
		for (let lx = Math.max(x - 3, 0); lx <= rx; ++lx) {
			if (this.getAt(lx, y) === cell) {
				if (++count === 4) {
					return [
						[lx - 3, y],
						[lx - 2, y],
						[lx - 1, y],
						[lx, y]
					] as [number, number][];
				}
			} else {
				count = 0;
			}
		}

		return null;
	}

	private checkVertical(x: number, y: number, cell: Cell) {
		/**
		 * 00__ 10__ 20__ 30__ 40__ 50__ 60__
		 * 01__ 11__ 21__ 31__ 41__ 51__ 61__
		 * 02__ 12__ 22__ 32_x 42__ 52__ 62__
		 * 03__ 13__ 23_o 33_x 43__ 53__ 63__
		 * 04__ 14__ 24_o 34_x 44__ 54__ 64__
		 * 05__ 15__ 25_o 35_x 45__ 55__ 65__
		 *
		 * Winning: { 32, 33, 34, 35 }
		 * Assuming last move as 32.
		 *
		 * Vertical check has one advantage versus the other ways: it needs to check three cells below the used cell,
		 * and nothing more. This is because cells are filled from bottom to top, so we don't need to check the cells
		 * in the top as they're always empty, thus saving a lot of computational cost.
		 *
		 * We retrieve the corner for this move:
		 * ty = y + 1
		 * by = y + 3
		 *
		 * We will also optimize one case: this needs y + 3 positions to be within the range, so we quickly return null
		 * when there isn't enough space.
		 *
		 * If it has space, we will only check the cells { x, ty } to { x, by } inclusive, { x, y } is not checked
		 * because it's `cell`'s value.
		 */

		// If there aren't enough rows in the same column to qualify, skip early
		if (y + 3 >= rows) return null;

		return this.getAt(x, y + 1) === cell && this.getAt(x, y + 2) === cell && this.getAt(x, y + 3) === cell
			? ([
					[x, y],
					[x, y + 1],
					[x, y + 2],
					[x, y + 3]
				] as [number, number][])
			: null;
	}

	private checkDiagonalTopLeftToBottomRight(x: number, y: number, cell: Cell) {
		/**
		 * 00__ 10__ 20__ 30__ 40__ 50__ 60__
		 * 01__ 11__ 21__ 31__ 41__ 51__ 61__
		 * 02_x 12__ 22__ 32__ 42__ 52__ 62__
		 * 03_o 13_x 23__ 33__ 43__ 53__ 63__
		 * 04_x 14_o 24_x 34_o 44__ 54__ 64__
		 * 05_o 15_o 25_o 35_x 45__ 55__ 65__
		 *
		 * Winning: { 02, 13, 24, 35 }
		 * Assuming last move as 02.
		 *
		 * We retrieve the corner for this move:
		 * clx = x - 3
		 * cly = y - 3
		 * crx = x + 3
		 * cry = y + 3
		 *
		 * We iterate from { clx, cly } to { crx, cry } inclusive, increasing by 1 both numbers.
		 */

		let count = 0;
		const crx = x + 3;
		const cry = y + 3;
		for (let clx = x - 3, cly = y - 3; clx <= crx && cly <= cry; ++clx, ++cly) {
			// Watch for boundaries, since we are going from top left, we might find cells in our way, we continue.
			if (clx < 0 || cly < 0) continue;

			// Watch for boundaries, if one goes to the bottom right, there cannot be more cells, we stop checking.
			if (clx === columns || cly === rows) return null;

			if (this.getAt(clx, cly) === cell) {
				if (++count === 4) {
					return [
						[clx - 3, cly - 3],
						[clx - 2, cly - 2],
						[clx - 1, cly - 1],
						[clx, cly]
					] as [number, number][];
				}
			} else {
				count = 0;
			}
		}

		return null;
	}

	private checkDiagonalBottomLeftToTopRight(x: number, y: number, cell: Cell) {
		/**
		 * 00__ 10__ 20__ 30__ 40__ 50__ 60__
		 * 01__ 11__ 21__ 31__ 41__ 51__ 61__
		 * 02__ 12__ 22__ 32__ 42__ 52__ 62_x
		 * 03__ 13__ 23__ 33__ 43__ 53_x 63_o
		 * 04__ 14__ 24__ 34__ 44_x 54_o 64_x
		 * 05__ 15__ 25__ 35_x 45_o 55_o 65_o
		 *
		 * Winning: { 35, 44, 53, 62 }
		 * Assuming last move as 62.
		 *
		 * We retrieve the corner for this move:
		 * clx = x - 3
		 * cly = y + 3
		 * crx = x + 3
		 * cry = y - 3
		 *
		 * We iterate from { clx, cly } to { crx, cry } inclusive, increasing clx by 1 and decreasing cly by 1.
		 */

		let count = 0;
		const crx = x + 3;
		const cry = y + 3;
		for (let clx = x - 3, cly = y + 3; clx <= crx && cly <= cry; ++clx, --cly) {
			// Watch for boundaries, since we are going from bottom left, we might find cells in our way, we continue.
			if (clx < 0 || cly >= rows) continue;

			// Watch for boundaries, if one goes to the bottom right, there cannot be more cells, we stop checking.
			if (clx === columns || cly < 0) return null;

			if (this.getAt(clx, cly) === cell) {
				if (++count === 4) {
					return [
						[clx - 3, cly + 3],
						[clx - 2, cly + 2],
						[clx - 1, cly + 1],
						[clx, cly]
					] as [number, number][];
				}
			} else {
				count = 0;
			}
		}

		return null;
	}

	private static readonly emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'].map(encodeURIComponent) as SerializedEmoji[];

	private static readonly players = [Emojis.PlayerOne, Emojis.PlayerTwo] as const;

	private static renderCell(cell: Cell) {
		switch (cell) {
			case Cell.Empty:
				return Emojis.Empty;
			case Cell.PlayerOne:
				return Emojis.PlayerOne;
			case Cell.PlayerTwo:
				return Emojis.PlayerTwo;
			case Cell.WinnerPlayerOne:
				return Emojis.WinnerOne;
			case Cell.WinnerPlayerTwo:
				return Emojis.WinnerTwo;
		}
	}
}
