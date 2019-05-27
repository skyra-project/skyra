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
			this.cells = this.stack.pop();
		}
	}

	public render() {
		const output = [];
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
		let count: number;

		// Check horizontal - include middle
		count = 0;
		for (let c = 0; c < kColumns; ++c) {
			if (this.getAt(c, y) === cell) {
				if (++count === 4) {
					return [
						[c - 3, y],
						[c - 2, y],
						[c - 1, y],
						[c, y]
					];
				}
			} else {
				count = 0;
			}
		}

		// Check vertical - include middle
		count = 0;
		for (let r = 0; r < kRows; ++r) {
			if (this.getAt(x, r) === cell) {
				if (++count === 4) {
					return [
						[x, r - 3],
						[x, r - 2],
						[x, r - 1],
						[x, r]
					];
				}
			} else {
				count = 0;
			}
		}

		// Check diagonal top-left to bottom-right - include middle
		count = 0;
		for (let r = 0; r <= kRows - 4; ++r) {
			let rPosition = r;
			for (let c = 0; c < kColumns && rPosition < kRows; ++c, ++rPosition) {
				if (this.getAt(c, rPosition) === cell) {
					if (++count === 4) {
						return [
							[c - 3, rPosition - 3],
							[c - 2, rPosition - 2],
							[c - 1, rPosition - 1],
							[c, rPosition]
						];
					}
				} else {
					count = 0;
				}
			}
		}

		// Check diagonal bottom-left to top-right - include middle
		count = 0;
		for (let r = kRows - 1; r >= kRows - 4; --r) {
			let rPosition = r;
			for (let c = 0; c < kColumns && rPosition < kRows && rPosition >= 0; ++c, --rPosition) {
				if (this.getAt(c, rPosition) === cell) {
					if (++count === 4) {
						return [
							[c - 3, rPosition + 3],
							[c - 2, rPosition + 2],
							[c - 1, rPosition + 1],
							[c, rPosition]
						];
					}
				} else {
					count = 0;
				}
			}
		}

		// Check diagonal bottom-left to top-right - after middle
		count = 0;
		for (let c = 1; c < kColumns; ++c) {
			let cPosition = c;
			for (let r = kRows - 1; r < kRows && cPosition < kColumns && cPosition >= 1; ++cPosition, --r) {
				if (this.getAt(cPosition, r) === cell) {
					if (++count === 4) {
						return [
							[cPosition - 3, r + 3],
							[cPosition - 2, r + 2],
							[cPosition - 1, r + 1],
							[cPosition, r]
						];
					}
				} else {
					count = 0;
				}
			}
		}
		return null;
	}

	public isTableFull() {
		for (let x = 0; x < kColumns; ++x) {
			if (!this.isLineFull(x)) return false;
		}
		return true;
	}

	public isLineFull(x: number) {
		return this.getAt(x, kRows - 1) !== Cell.Empty;
	}

	public getMoveAt(x: number) {
		for (let y = kRows; y >= 0; --y) {
			if (this.getAt(x, y) === Cell.Empty) return y;
		}
		return -1;
	}

	private static renderCell(cell: Cell) {
		switch (cell) {
			case Cell.Empty: return '<:Empty:352403997606412289>';
			case Cell.PlayerOne: return '<:PlayerONE:352403997300359169>';
			case Cell.PlayerTwo: return '<:PlayerTWO:352404081974968330>';
			case Cell.WinnerPlayerOne: return '<:PlayerONEWin:352403997761601547>';
			case Cell.WinnerPlayerTwo: return '<:PlayerTWOWin:352403997958602752>';
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
