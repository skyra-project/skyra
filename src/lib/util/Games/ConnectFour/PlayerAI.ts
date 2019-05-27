import { Player, PlayerColor } from './Player';
import { Game } from './Game';
import { Cell } from './Board';

export class PlayerAI extends Player {

	public constructor(game: Game, cell: Cell, winning: Cell, color: PlayerColor) {
		super(game, cell, winning, color, 'Skyra');
	}

	public start() {

	}

	public finish() {

	}

}
