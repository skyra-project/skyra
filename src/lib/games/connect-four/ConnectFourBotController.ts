import { cast } from '#utils/util';
import { ticTacToe } from '@skyra/ai';
import { BaseBotController } from '../base/BaseBotController';
import type { ConnectFourGame } from './ConnectFourGame';

export class ConnectFourBotController extends BaseBotController<number> {
	public await(): number {
		const game = cast<ConnectFourGame>(this.game);
		// TODO: Replace this with ConnectFour AI
		return ticTacToe(game.board);
	}
}
