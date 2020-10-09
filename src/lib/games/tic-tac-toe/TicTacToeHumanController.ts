import type { LLRCData } from '@utils/LongLivingReactionCollector';
import { cast } from '@utils/util';
import { BaseReactionController } from '../base/BaseReactionController';
import type { TicTacToeGame } from './TicTacToeGame';

export class TicTacToeHumanController extends BaseReactionController<number> {
	public async await(): Promise<number> {
		const reaction = await this.collectAvailableReaction();
		if (reaction === null) return -1;

		const game = cast<TicTacToeGame>(this.game);
		return game.reactions.indexOf(reaction);
	}

	protected resolveCollectedValidity(collected: string): boolean {
		const game = cast<TicTacToeGame>(this.game);
		return game.reactions.indexOf(collected) !== -1;
	}

	protected resolveCollectedData(reaction: LLRCData): string | null {
		return reaction.emoji.name;
	}
}
