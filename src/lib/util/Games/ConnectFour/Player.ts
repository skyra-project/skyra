import { Game } from './Game';
import { Cell } from './Board';

export enum PlayerColor {
	Blue,
	Red
}

export abstract class Player {

	public name: string;
	public color: PlayerColor;
	protected game: Game;
	protected cell: Cell;
	private winning: Cell;

	public constructor(game: Game, cell: Cell, winning: Cell, color: PlayerColor, name: string) {
		this.name = name;
		this.color = color;
		this.game = game;
		this.cell = cell;
		this.winning = winning;
	}

	public finish(): Promise<void> | void {
		if (this.game.stopped && !this.game.winner) return;
		const { next } = this.game;
		this.game.content = this.game.language.tget(
			this.game.winner ? 'COMMAND_C4_GAME_WIN' : 'COMMAND_C4_GAME_NEXT',
			next!.name,
			next!.color
		);
	}

	protected drop(x: number) {
		const y = this.game.board.getMoveAt(x);
		if (y === -1) return false;

		// Can set
		this.game.board.setAt(x, y, this.cell);

		const cells = this.game.board.check(x, y);
		if (cells) {
			for (const [c, r] of cells) {
				this.game.board.setAt(c, r, this.winning);
			}
			this.game.winner = this;
		}
		return true;
	}

	public abstract start(): Promise<void> | void;

}
