import { GuildSettings, readSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { Colors } from '#utils/constants';
import { getCustomEmojiUrl, getEmojiId, getEmojiReactionFormat, getEncodedTwemoji, getTwemojiUrl, type SerializedEmoji } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { Collection, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.RawReactionAdd })
export class UserListener extends Listener {
	private readonly kCountCache = new Collection<string, InternalCacheEntry>();
	private readonly kSyncCache = new Collection<string, Promise<InternalCacheEntry>>();
	private kTimerSweeper: NodeJS.Timeout | null = null;

	public async run(data: LLRCData, emoji: SerializedEmoji) {
		// If the bot cannot fetch messages, do not proceed:
		if (!this.canFetchMessages(data.channel)) return;

		const key = GuildSettings.Channels.Logs.Reaction;
		const [allowedEmojis, logChannelId, twemojiEnabled, ignoreChannels, ignoreReactionAdd, ignoreAllEvents, t] = await readSettings(
			data.guild,
			(settings) => [
				settings[GuildSettings.Selfmod.Reactions.Allowed],
				settings[key],
				settings[GuildSettings.Events.IncludeTwemoji],
				settings[GuildSettings.Messages.IgnoreChannels],
				settings[GuildSettings.Channels.Ignore.ReactionAdd],
				settings[GuildSettings.Channels.Ignore.All],
				settings.getLanguage()
			]
		);

		const emojiId = getEmojiId(emoji);
		if (allowedEmojis.some((allowedEmoji) => getEmojiId(allowedEmoji) === emojiId)) return;

		this.container.client.emit(Events.ReactionBlocked, data, emoji);
		if (isNullish(logChannelId) || (!twemojiEnabled && data.emoji.id === null)) return;

		if (ignoreChannels.includes(data.channel.id)) return;
		if (ignoreReactionAdd.some((id) => id === data.channel.id || data.channel.parentId === id)) return;
		if (ignoreAllEvents.some((id) => id === data.channel.id || data.channel.parentId === id)) return;

		if ((await this.retrieveCount(data, emoji)) > 1) return;

		const user = await this.container.client.users.fetch(data.userId);
		if (user.bot) return;

		this.container.client.emit(Events.GuildMessageLog, data.guild, logChannelId, key, () =>
			new EmbedBuilder()
				.setColor(Colors.Green)
				.setAuthor(getFullEmbedAuthor(user))
				.setThumbnail(
					data.emoji.id === null //
						? getTwemojiUrl(getEncodedTwemoji(data.emoji.name!))
						: getCustomEmojiUrl(data.emoji.id, data.emoji.animated)
				)
				.setDescription(
					[
						`**Emoji**: ${data.emoji.name}${data.emoji.id === null ? '' : ` [${data.emoji.id}]`}`,
						`**Channel**: ${data.channel}`,
						`**Message**: [${t(LanguageKeys.Misc.JumpTo)}](https://discord.com/channels/${data.guild.id}/${data.channel.id}/${
							data.messageId
						})`
					].join('\n')
				)
				.setFooter({ text: `${t(LanguageKeys.Events.Reactions.Reaction)} • ${data.channel.name}` })
				.setTimestamp()
		);
	}

	public override onUnload() {
		super.onUnload();
		if (this.kTimerSweeper) clearInterval(this.kTimerSweeper);
	}

	private canFetchMessages(channel: GuildTextBasedChannelTypes) {
		const permissions = channel.permissionsFor(this.container.client.id!);
		return !isNullish(permissions) && permissions.has(PermissionFlagsBits.ReadMessageHistory);
	}

	private async retrieveCount(data: LLRCData, emoji: SerializedEmoji) {
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
		const promise = this.fetchCount(data, emoji, id);
		this.kSyncCache.set(id, promise);
		return (await promise).count;
	}

	private async fetchCount(data: LLRCData, emoji: SerializedEmoji, id: string) {
		const users = await api().channels.getMessageReactions(data.channel.id, data.messageId, getEmojiReactionFormat(emoji));
		const count: InternalCacheEntry = { count: users.length, sweepAt: Date.now() + 120000 };
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
}

interface InternalCacheEntry {
	sweepAt: number;
	count: number;
}
