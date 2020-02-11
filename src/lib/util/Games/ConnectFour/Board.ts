import { ConnectFourConstants } from '@utils/constants';

export enum Cell {
	Empty,
	PlayerOne,
	PlayerTwo,
	WinnerPlayerOne,
	WinnerPlayerTwo
}

export const kColumns = 7;
export const kRows = 6;
const kRenderMargin = '       ';

export class Board {

	private cells: Cell[];
	private stack: Cell[][];

	public constructor(cells?: readonly Cell[]) {
		if (!cells) cells = Board.generate();
		this.cells = cells as Cell[];
		this.stack = [];
	}

	public getAt(x: number, y: number) {
		return this.cells[x + (y * kColumns)];
	}

	public setAt(x: number, y: number, value: Cell) {
		this.cells[x + (y * kColumns)] = value;
	}

	public save() {
		this.stack.push(this.cells.slice(0));
	}

	public restore() {
		if (this.stack.length) {
			this.cells = this.stack.pop()!;
		}
	}

	public render() {
		const output: string[] = [];
		for (let y = 0; y < kRows; ++y) {
			// Render each line
			const line: string[] = [];
			for (let x = 0; x < kColumns; ++x) {
				line.push(Board.renderCell(this.getAt(x, y)));
			}
			output.push(line.join(kRenderMargin));
		}

		return output.join('\n');
	}

	public check(x: number, y: number): readonly [number, number][] | null {
		const cell = this.getAt(x, y);

		return this.checkVertical(x, y, cell)
			|| this.checkHorizontal(y, cell)
			|| this.checkDiagonalTopLeftToBottomRight(x, y, cell)
			|| this.checkDiagonalBottomLeftToTopRight(x, y, cell);
	}

	public isTableFull() {
		for (let x = 0; x < kColumns; ++x) {
			if (!this.isLineFull(x)) return false;
		}
		return true;
	}

	public isLineFull(x: number) {
		return this.getAt(x, 0) !== Cell.Empty;
	}

	public getMoveAt(x: number) {
		for (let y = kRows; y >= 0; --y) {
			if (this.getAt(x, y) === Cell.Empty) return y;
		}
		return -1;
	}

	private checkHorizontal(y: number, cell: Cell) {
		let count = 0;
		for (let column = 0; column < kColumns; ++column) {
			if (this.getAt(column, y) === cell) {
				if (++count === 4) {
					return [
						[column - 3, y],
						[column - 2, y],
						[column - 1, y],
						[column, y]
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
		 * 0
		 * 1
		 * 2
		 * 3
		 * 4
		 * 5
		 * kRows (6)
		 * For a vertical to check out in a table with a height of 6 elements, it needs the kRows - 4 th (2nd in this
		 * case) cell to be filled.
		 *
		* If there aren't enough rows in the same column to qualify, skip early
		*/
		if (y > kRows - 4) return null;

		return this.getAt(x, y + 1) === cell
			&& this.getAt(x, y + 2) === cell
			&& this.getAt(x, y + 3) === cell
			? [
				[x, y],
				[x, y + 1],
				[x, y + 2],
				[x, y + 3]
			] as [number, number][]
			: null;
	}

	private checkDiagonalTopLeftToBottomRight(x: number, y: number, cell: Cell) {
		/**
		 * 00__ 10__ 20__ 30__ 40__ 50__ 60__ 70__
		 * 01__ 11__ 21__ 31__ 41__ 51__ 61__ 71__
		 * 02_x 12__ 22__ 32__ 42__ 52__ 62__ 72__
		 * 03_o 13_x 23__ 33__ 43__ 53__ 63__ 73__
		 * 04_x 14_o 24_x 34_o 44__ 54__ 64__ 74__
		 * 05_o 15_o 25_o 35_x 45__ 55__ 65__ 75__
		 *
		 * Winning: { 02, 13, 24, 35 }
		 * Assuming last move as 02
		 *
		 * We retrieve the corner for this move:
		 * clx = x - 3
		 * cly = y - 3
		 * crx = x + 3
		 * cry = y + 3
		 *
		 * We iterate from { clx, cly } to { crx, cry } inclusive, increasing by 1 both numbers
		 */

		let count = 0;
		const crx = x + 3;
		const cry = y + 3;
		for (let clx = x - 3, cly = y - 3; clx <= crx && cly <= cry; ++clx, ++cly) {
			// Watch for boundaries, since we are going from top left, we might find cells in our way, we continue.
			if (clx < 0 || cly < 0) continue;

			// Watch for boundaries, if one goes to the bottom right, there cannot be more cells, we stop checking.
			if (clx === kColumns || cly === kRows) return null;

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
		 * 00__ 10__ 20__ 30__ 40__ 50__ 60__ 70__
		 * 01__ 11__ 21__ 31__ 41__ 51__ 61__ 71__
		 * 02__ 12__ 22__ 32__ 42__ 52__ 62_x 72__
		 * 03__ 13__ 23__ 33__ 43__ 53_x 63_o 73__
		 * 04__ 14__ 24__ 34__ 44_x 54_o 64_x 74__
		 * 05__ 15__ 25__ 35_x 45_o 55_o 65_o 75__
		 *
		 * Winning: { 35, 44, 53, 62 }
		 * Assuming last move as 62
		 *
		 * We retrieve the corner for this move:
		 * clx = x - 3
		 * cly = y + 3
		 * crx = x + 3
		 * cry = y - 3
		 *
		 * We iterate from { clx, cly } to { crx, cry } inclusive, increasing clx by 1 and decreasing cly by 1
		 */

		let count = 0;
		const crx = x + 3;
		const cry = y + 3;
		for (let clx = x - 3, cly = y + 3; clx <= crx && cly <= cry; ++clx, --cly) {
			// Watch for boundaries, since we are going from bottom left, we might find cells in our way, we continue.
			if (clx < 0 || cly >= kRows) continue;

			// Watch for boundaries, if one goes to the bottom right, there cannot be more cells, we stop checking.
			if (clx === kColumns || cly < 0) return null;

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

	private static renderCell(cell: Cell) {
		switch (cell) {
			case Cell.Empty: return ConnectFourConstants.Emojis.Empty;
			case Cell.PlayerOne: return ConnectFourConstants.Emojis.PlayerOne;
			case Cell.PlayerTwo: return ConnectFourConstants.Emojis.PlayerTwo;
			case Cell.WinnerPlayerOne: return ConnectFourConstants.Emojis.WinnerOne;
			case Cell.WinnerPlayerTwo: return ConnectFourConstants.Emojis.WinnerTwo;
		}
	}

	private static generate(): readonly Cell[] {
		const cells: Cell[] = [];
		for (let i = 0, max = kColumns * kRows; i < max; ++i) {
			cells[i] = Cell.Empty;
		}
		return cells;
	}

}
