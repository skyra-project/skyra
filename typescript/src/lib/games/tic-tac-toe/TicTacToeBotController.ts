import { cast } from '#utils/util';
import { ticTacToe } from '@skyra/ai';
import { BaseBotController } from '../base/BaseBotController';
import type { TicTacToeGame } from './TicTacToeGame';

export class TicTacToeBotController extends BaseBotController<number> {
	public await(): number {
		const game = cast<TicTacToeGame>(this.game);
		return ticTacToe(game.board);
	}
}
