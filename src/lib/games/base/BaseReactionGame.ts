import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { LongLivingReactionCollector } from '@utils/LongLivingReactionCollector';
import { pickRandom } from '@utils/util';
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

	protected async onStart(): Promise<unknown> {
		try {
			this.message = await this.message.send(pickRandom(this.language.get(LanguageKeys.System.Loading)));
			for (const reaction of this.reactions) await this.message.react(reaction);
		} catch {
			await this.message.sendLocale(LanguageKeys.Misc.UnexpectedIssue).catch((error) => this.client.emit(Events.ApiError, error));
		}

		return super.onStart();
	}

	protected get finished(): boolean {
		return this.listener.ended;
	}

	protected onEnd(): unknown {
		this.listener.end();
		return super.onEnd();
	}
}
