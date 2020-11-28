import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Cell } from './Board';
import { Game } from './Game';

export enum PlayerColor {
	Blue,
	Red
}

export abstract class Player {
	public name: string;
	public color: PlayerColor;
	protected game: Game;
	protected cell: Cell;
	private readonly winning: Cell;

	protected constructor(game: Game, cell: Cell, winning: Cell, color: PlayerColor, name: string) {
		this.name = name;
		this.color = color;
		this.game = game;
		this.cell = cell;
		this.winning = winning;
	}

	public finish(): Promise<void> | void {
		if (this.game.stopped && !this.game.winner) return;
		const { next } = this.game;
		const languageKey = this.game.winner
			? next!.color === PlayerColor.Blue
				? LanguageKeys.Commands.Games.C4GameWinTurn0
				: LanguageKeys.Commands.Games.C4GameWin
			: next!.color === PlayerColor.Blue
			? LanguageKeys.Commands.Games.C4GameNextTurn0
			: LanguageKeys.Commands.Games.C4GameNext;
		this.game.content = this.game.language.get(languageKey, {
			user: next!.name
		});
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
