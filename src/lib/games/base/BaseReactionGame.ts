import { LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import type { Message } from 'discord.js';
import type { BaseController } from './BaseController';
import { BaseGame } from './BaseGame';

export abstract class BaseReactionGame<T> extends BaseGame<T> {
	public readonly reactions: readonly string[];
	public readonly listener: LongLivingReactionCollector;
	public readonly reactionTime: number;

	public constructor(
		message: Message,
		playerA: BaseController<T>,
		playerB: BaseController<T>,
		reactions: readonly string[],
		reactionTime: number,
		turn = BaseGame.getTurn()
	) {
		super(message, playerA, playerB, turn);
		this.reactions = reactions;
		this.reactionTime = reactionTime;
		this.listener = new LongLivingReactionCollector(this.client);
	}

	protected get finished(): boolean {
		return this.listener.ended;
	}

	protected onEnd(): void {
		this.listener.end();
	}
}
