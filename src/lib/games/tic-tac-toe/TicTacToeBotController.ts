import { BaseBotController } from '#lib/games/base/BaseBotController';
import type { TicTacToeGame } from '#lib/games/tic-tac-toe/TicTacToeGame';
import { cast } from '#utils/util';
import { ticTacToe } from '@skyra/ai';

export class TicTacToeBotController extends BaseBotController<number> {
	public await(): number {
		const game = cast<TicTacToeGame>(this.game);
		return ticTacToe(game.board);
	}
}
