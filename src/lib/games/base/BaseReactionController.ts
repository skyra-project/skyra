import { api } from '#lib/discord/Api';
import { BaseController } from '#lib/games/base/BaseController';
import type { BaseReactionGame } from '#lib/games/base/BaseReactionGame';
import { Events } from '#lib/types';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { getEmojiReactionFormat, getEmojiString, type SerializedEmoji } from '#utils/functions';
import { cast } from '#utils/util';
import { container } from '@sapphire/framework';
import { DiscordAPIError, RESTJSONErrorCodes } from 'discord.js';

export abstract class BaseReactionController<T> extends BaseController<T> {
	public readonly userId: string;

	public constructor(name: string, userId: string) {
		super(name);
		this.userId = userId;
	}

	protected async collectAvailableReaction(): Promise<string | null> {
		const game = cast<BaseReactionGame<T>>(this.game);
		return new Promise((resolve) => {
			game.listener.setTime(game.reactionTime);
			game.listener.setListener((data) => {
				if (data.userId !== this.userId) return;
				if (data.messageId !== game.message.id) return;

				const emoji = getEmojiString(data.emoji);
				if (game.reactions.includes(emoji) && this.resolveCollectedValidity(emoji)) {
					void this.removeEmoji(data, emoji, this.userId);
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

	protected async removeEmoji(reaction: LLRCData, emoji: SerializedEmoji, userId: string): Promise<void> {
		try {
			await api().channels.deleteUserMessageReaction(reaction.channel.id, reaction.messageId, getEmojiReactionFormat(emoji), userId);
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				if (error.code === RESTJSONErrorCodes.UnknownMessage || error.code === RESTJSONErrorCodes.UnknownEmoji) return;
			}

			container.client.emit(Events.Error, error);
		}
	}
}
