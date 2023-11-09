import type { BaseController } from '#lib/games/base/BaseController';
import { BaseGame } from '#lib/games/base/BaseGame';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import { LongLivingReactionCollector } from '#utils/LongLivingReactionCollector';
import { sendLoadingMessage } from '#utils/util';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

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
		this.listener = new LongLivingReactionCollector();
	}

	protected override async onStart(): Promise<unknown> {
		try {
			this.message = await sendLoadingMessage(this.message, this.t);
			for (const reaction of this.reactions) await this.message.react(reaction);
		} catch {
			await send(this.message, this.t(LanguageKeys.Misc.UnexpectedIssue)).catch((error) => this.client.emit(Events.Error, error));
		}

		return super.onStart();
	}

	protected get finished(): boolean {
		return this.listener.ended;
	}

	protected override onEnd(): Promise<unknown> {
		this.listener.end();
		return super.onEnd();
	}
}
