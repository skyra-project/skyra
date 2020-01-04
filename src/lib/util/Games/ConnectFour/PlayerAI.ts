import { util } from 'klasa';
import { Cell, kColumns, kRows } from './Board';
import { Game } from './Game';
import { Player, PlayerColor } from './Player';

const kPoints = 100000;

export class PlayerAI extends Player {

	private readonly opposite: Cell;

	public constructor(game: Game, cell: Cell, winning: Cell, color: PlayerColor) {
		super(game, cell, winning, color, 'Skyra');
		this.opposite = cell === Cell.PlayerOne ? Cell.PlayerTwo : Cell.PlayerOne;
	}

	public async start() {
		await util.sleep(250);

		const { board } = this.game;
		let bestMove = -kPoints;
		let bestMoveFound = -1;
		for (let x = 0; x < kColumns; ++x) {
			if (board.isLineFull(x)) continue;
			const value = this.minimax(5, -kPoints, kPoints, false);
			if (value >= bestMove) {
				bestMove = value;
				bestMoveFound = x;
			}
		}

		if (bestMoveFound !== -1) {
			this.drop(bestMoveFound);
		}
	}

	private minimax(depth: number, alpha: number, beta: number, isMaximisingPlayer: boolean) {
		if (depth === 0) {
			return -this.evaluate();
		}

		const { board } = this.game;
		if (isMaximisingPlayer) {
			let bestMove = -kPoints;
			let win: boolean;
			for (let x = 0; x < kColumns; ++x) {
				if (board.isLineFull(x)) continue;
				board.save();
				win = this.simulateDrop(x, this.opposite);
				if (win) {
					board.restore();
					return kPoints;
				}
				bestMove = Math.max(bestMove, this.minimax(depth - 1, alpha, beta, !isMaximisingPlayer));
				board.restore();
				alpha = Math.max(alpha, bestMove);
				if (beta <= alpha) {
					return bestMove;
				}
			}

			return bestMove;
		}

		let bestMove = kPoints;
		let win: boolean;
		for (let x = 0; x < kColumns; ++x) {
			if (board.isLineFull(x)) continue;
			board.save();
			win = this.simulateDrop(x, this.cell);
			if (win) {
				board.restore();
				return -kPoints;
			}
			bestMove = Math.min(bestMove, this.minimax(depth - 1, alpha, beta, !isMaximisingPlayer));
			board.restore();
			beta = Math.min(beta, bestMove);
			if (beta <= alpha) {
				return bestMove;
			}
		}

		return bestMove;
	}

	private simulateDrop(x: number, cell: Cell) {
		const y = this.game.board.getMoveAt(x);
		if (y === -1) return false;

		// Can set
		this.game.board.setAt(x, y, cell);
		return Boolean(this.game.board.check(x, y));
	}

	private evaluate() {
		let verticalPoints = 0;
		let horizontalPoints = 0;
		let diagonalPoints1 = 0;
		let diagonalPoints2 = 0;

		// Board-size: 7x6 (height x width)
		// Array indices begin with 0
		// => e.g. height: 0, 1, 2, 3, 4, 5

		// Vertical points
		// Check each column for vertical score
		//
		// Possible situations
		//  0  1  2  3  4  5  6
		// [x][ ][ ][ ][ ][ ][ ] 0
		// [x][x][ ][ ][ ][ ][ ] 1
		// [x][x][x][ ][ ][ ][ ] 2
		// [x][x][x][ ][ ][ ][ ] 3
		// [ ][x][x][ ][ ][ ][ ] 4
		// [ ][ ][x][ ][ ][ ][ ] 5
		for (let y = 0; y < kRows - 3; ++y) {
			// For each column
			for (let x = 0; x < kColumns; ++x) {
				const score = this.evaluatePosition(y, x, 1, 0);
				if (score === kPoints) return kPoints;
				if (score === -kPoints) return -kPoints;
				verticalPoints += score;
			}
		}

		// Horizontal points
		// Check each row's score
		//
		// Possible situations
		//  0  1  2  3  4  5  6
		// [x][x][x][x][ ][ ][ ] 0
		// [ ][x][x][x][x][ ][ ] 1
		// [ ][ ][x][x][x][x][ ] 2
		// [ ][ ][ ][x][x][x][x] 3
		// [ ][ ][ ][ ][ ][ ][ ] 4
		// [ ][ ][ ][ ][ ][ ][ ] 5
		for (let y = 0; y < kRows; ++y) {
			for (let x = 0; x < kColumns - 3; ++x) {
				const score = this.evaluatePosition(y, x, 0, 1);
				if (score === kPoints) return kPoints;
				if (score === -kPoints) return -kPoints;
				horizontalPoints += score;
			}
		}

		// Diagonal points 1 (left-bottom)
		//
		// Possible situation
		//  0  1  2  3  4  5  6
		// [x][ ][ ][ ][ ][ ][ ] 0
		// [ ][x][ ][ ][ ][ ][ ] 1
		// [ ][ ][x][ ][ ][ ][ ] 2
		// [ ][ ][ ][x][ ][ ][ ] 3
		// [ ][ ][ ][ ][ ][ ][ ] 4
		// [ ][ ][ ][ ][ ][ ][ ] 5
		for (let y = 0; y < kRows - 3; ++y) {
			for (let x = 0; x < kColumns - 3; ++x) {
				const score = this.evaluatePosition(y, x, 1, 1);
				if (score === kPoints) return kPoints;
				if (score === -kPoints) return -kPoints;
				diagonalPoints1 += score;
			}
		}

		// Diagonal points 2 (right-bottom)
		//
		// Possible situation
		//  0  1  2  3  4  5  6
		// [ ][ ][ ][x][ ][ ][ ] 0
		// [ ][ ][x][ ][ ][ ][ ] 1
		// [ ][x][ ][ ][ ][ ][ ] 2
		// [x][ ][ ][ ][ ][ ][ ] 3
		// [ ][ ][ ][ ][ ][ ][ ] 4
		// [ ][ ][ ][ ][ ][ ][ ] 5
		for (let y = 3; y < kRows; ++y) {
			for (let x = 0; x <= kColumns - 4; ++x) {
				const score = this.evaluatePosition(y, x, -1, +1);
				if (score === kPoints) return kPoints;
				if (score === -kPoints) return -kPoints;
				diagonalPoints2 += score;
			}

		}

		return horizontalPoints + verticalPoints + diagonalPoints1 + diagonalPoints2;
	}

	private evaluatePosition(row: number, column: number, deltaY: number, deltaX: number) {
		let humanPoints = 0;
		let computerPoints = 0;

		// Determine score through amount of available chips
		for (let i = 0; i < 4; i++) {
			const cell = this.game.board.getAt(column, row);
			if (cell === Cell.Empty) continue;
			if (cell === this.cell) {
				computerPoints++;
			} else {
				humanPoints++;
			}

			// Moving through our board
			row += deltaY;
			column += deltaX;
		}

		// Marking winning/returning score
		if (humanPoints === 4) {
			// Computer won (100000)
			return -kPoints;
		}

		if (computerPoints === 4) {
			// Human won (-100000)
			return kPoints;
		}

		// Return normal points
		return computerPoints;
	}

}
