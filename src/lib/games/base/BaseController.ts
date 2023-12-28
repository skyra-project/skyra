import { BaseGame, GameTurn } from '#lib/games/base/BaseGame';

export abstract class BaseController<T> {
	public readonly name: string;

	public turn: GameTurn = GameTurn.PlayerA;
	public game: BaseGame<T> = null!;

	public constructor(name: string) {
		this.name = name;
	}

	public setTurn(turn: GameTurn): this {
		this.turn = turn;
		return this;
	}

	public setGame(game: BaseGame<T>): this {
		this.game = game;
		return this;
	}

	public abstract await(): Promise<T> | T;
}
