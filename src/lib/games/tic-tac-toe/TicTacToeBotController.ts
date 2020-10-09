import { ticTacToe } from '@skyra/ai';
import { cast } from '@utils/util';
import { BaseReactionController } from '../base/BaseReactionController';
import type { TicTacToeGame } from './TicTacToeGame';

export class TicTacToeBotController extends BaseReactionController<number> {
	public await(): number {
		const game = cast<TicTacToeGame>(this.game);
		return ticTacToe(game.board);
	}

	protected resolveCollectedValidity(): boolean {
		return true;
	}
}
