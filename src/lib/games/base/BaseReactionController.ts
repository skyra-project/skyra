import { LLRCData } from '#utils/LongLivingReactionCollector';
import { cast, resolveEmoji } from '#utils/util';
import { BaseController } from './BaseController';
import { BaseReactionGame } from './BaseReactionGame';

export abstract class BaseReactionController<T> extends BaseController<T> {
	public readonly userID: string;

	public constructor(name: string, userID: string) {
		super(name);
		this.userID = userID;
	}

	protected async collectAvailableReaction(): Promise<string | null> {
		const game = cast<BaseReactionGame<T>>(this.game);
		return new Promise((resolve) => {
			game.listener.setTime(game.reactionTime);
			game.listener.setListener((data) => {
				if (data.userID !== this.userID) return;
				if (data.messageID !== game.message.id) return;

				const emoji = this.resolveCollectedData(data);
				if (!emoji) return;

				if (game.reactions.includes(emoji) && this.resolveCollectedValidity(emoji)) {
					game.listener.setListener(null);
					game.listener.setTime(-1);
					resolve(emoji);
				}
			});

			game.listener.setEndListener(() => {
				resolve(null);
			});
		});
	}

	protected abstract resolveCollectedValidity(collected: string): boolean;

	protected resolveCollectedData(reaction: LLRCData): string | null {
		return resolveEmoji(reaction.emoji);
	}
}
