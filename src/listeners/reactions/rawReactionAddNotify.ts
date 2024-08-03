import { readSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import type { LLRCData, LLRCDataEmoji } from '#utils/LongLivingReactionCollector';
import { toErrorCodeResult } from '#utils/common';
import { Colors } from '#utils/constants';
import {
	getCodeStyle,
	getCustomEmojiUrl,
	getEmojiId,
	getEmojiReactionFormat,
	getEncodedTwemoji,
	getLogPrefix,
	getLogger,
	getTwemojiUrl,
	type SerializedEmoji
} from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import {
	Collection,
	PermissionFlagsBits,
	RESTJSONErrorCodes,
	inlineCode,
	messageLink,
	type RESTGetAPIChannelMessageReactionUsersResult
} from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.RawReactionAdd })
export class UserListener extends Listener {
	private readonly kCountCache = new Collection<string, InternalCacheEntry>();
	private readonly kSyncCache = new Collection<string, Promise<InternalCacheEntry | null>>();
	private kTimerSweeper: NodeJS.Timeout | null = null;

	public async run(data: LLRCData, emoji: SerializedEmoji) {
		// If the bot cannot fetch messages, do not proceed:
		if (!this.#canFetchMessages(data.channel)) return;

		const settings = await readSettings(data.guild);
		const t = getT(settings.language);
		const allowedEmojis = settings.selfmodReactionsAllowed;

		const emojiId = getEmojiId(emoji);
		if (allowedEmojis.some((allowedEmoji) => getEmojiId(allowedEmoji as SerializedEmoji) === emojiId)) return;

		const targetChannelId = settings.channelsLogsReaction;

		this.container.client.emit(Events.ReactionBlocked, data, emoji);
		if (isNullish(targetChannelId) || (!settings.eventsTwemojiReactions && data.emoji.id === null)) return;

		if (settings.messagesIgnoreChannels.includes(data.channel.id)) return;
		if (settings.channelsIgnoreReactionAdd.some((id) => id === data.channel.id || data.channel.parentId === id)) return;
		if (settings.channelsIgnoreAll.some((id) => id === data.channel.id || data.channel.parentId === id)) return;

		const count = await this.#retrieveCount(data, emoji);
		if (isNullish(count) || count > 1) return;

		const user = await this.container.client.users.fetch(data.userId);
		if (user.bot) return;

		await getLogger(data.guild).send({
			key: 'channelsLogsReaction',
			channelId: targetChannelId,
			makeMessage: () =>
				new EmbedBuilder()
					.setColor(Colors.Green)
					.setAuthor(getFullEmbedAuthor(user))
					.setThumbnail(this.#renderThumbnail(data.emoji))
					.setDescription(this.#renderDescription(t, data))
					.setFooter({ text: t(LanguageKeys.Events.Reactions.ReactionFooter) })
					.setTimestamp()
		});
	}

	public override onUnload() {
		super.onUnload();
		if (this.kTimerSweeper) clearInterval(this.kTimerSweeper);
	}

	#renderThumbnail(emoji: LLRCDataEmoji) {
		return emoji.id === null //
			? getTwemojiUrl(getEncodedTwemoji(emoji.name!))
			: getCustomEmojiUrl(emoji.id, emoji.animated);
	}

	#renderDescription(t: TFunction, data: LLRCData) {
		return t(LanguageKeys.Events.Reactions.ReactionDescription, {
			emoji: data.emoji.id ? `${data.emoji.name} (${inlineCode(data.emoji.id)})` : data.emoji.name,
			message: messageLink(data.channel.id, data.messageId, data.guild.id)
		});
	}

	#canFetchMessages(channel: GuildTextBasedChannelTypes) {
		const permissions = channel.permissionsFor(this.container.client.id!);
		return !isNullish(permissions) && permissions.has(PermissionFlagsBits.ViewChannel | PermissionFlagsBits.ReadMessageHistory);
	}

	async #retrieveCount(data: LLRCData, emoji: SerializedEmoji): Promise<number | null> {
		const id = `${data.messageId}.${getEmojiId(emoji)}`;

		// Pull from sync queue, and if it exists, await
		const sync = this.kSyncCache.get(id);
		if (typeof sync !== 'undefined') await sync;

		// Retrieve the reaction count
		const previousCount = this.kCountCache.get(id);
		if (typeof previousCount !== 'undefined') {
			previousCount.count++;
			previousCount.sweepAt = Date.now() + 120000;
			return previousCount.count;
		}

		// Pull the reactions from the API
		const promise = this.#fetchCount(data, emoji, id);
		this.kSyncCache.set(id, promise);

		const resolved = await promise;
		return isNullish(resolved) ? null : resolved.count;
	}

	async #fetchCount(data: LLRCData, emoji: SerializedEmoji, id: string): Promise<InternalCacheEntry | null> {
		const result = await toErrorCodeResult(api().channels.getMessageReactions(data.channel.id, data.messageId, getEmojiReactionFormat(emoji)));
		return result.match({
			ok: (data) => this.#fetchCountOk(data, id),
			err: (error) => this.#fetchCountErr(error)
		});
	}

	#fetchCountOk(data: RESTGetAPIChannelMessageReactionUsersResult, id: string): InternalCacheEntry {
		const count: InternalCacheEntry = { count: data.length, sweepAt: Date.now() + 120000 };
		this.kCountCache.set(id, count);
		this.kSyncCache.delete(id);

		if (this.kTimerSweeper === null) {
			this.kTimerSweeper = setInterval(() => {
				const now = Date.now();
				this.kCountCache.sweep((entry) => entry.sweepAt < now);
				if (this.kTimerSweeper !== null && this.kCountCache.size === 0) {
					clearInterval(this.kTimerSweeper);
					this.kTimerSweeper = null;
				}
			}, 5000).unref();
		}

		return count;
	}

	#fetchCountErr(code: RESTJSONErrorCodes): InternalCacheEntry | null {
		if (!UserListener.IgnoreReactionCountFetchErrors.includes(code)) {
			this.container.logger.error(`${getLogPrefix(this)} ${getCodeStyle(code)} Failed to fetch message reaction count.`);
		}

		return null;
	}

	private static readonly IgnoreReactionCountFetchErrors = [
		RESTJSONErrorCodes.UnknownMessage,
		RESTJSONErrorCodes.UnknownChannel,
		RESTJSONErrorCodes.UnknownGuild,
		RESTJSONErrorCodes.UnknownEmoji,
		RESTJSONErrorCodes.MissingAccess
	];
}

interface InternalCacheEntry {
	sweepAt: number;
	count: number;
}
