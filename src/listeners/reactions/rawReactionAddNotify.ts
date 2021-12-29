import { GuildSettings, readSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types/Enums';
import { Colors } from '#utils/constants';
import { getEmojiId, getEmojiReactionFormat, SerializedEmoji } from '#utils/functions';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { twemoji } from '#utils/util';
import Collection from '@discordjs/collection';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import type { APIUser } from 'discord-api-types/v9';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.RawReactionAdd })
export class UserListener extends Listener {
	private readonly kCountCache = new Collection<string, InternalCacheEntry>();
	private readonly kSyncCache = new Collection<string, Promise<InternalCacheEntry>>();
	private kTimerSweeper: NodeJS.Timer | null = null;

	public async run(data: LLRCData, emoji: SerializedEmoji) {
		const key = GuildSettings.Channels.Logs.Reaction;
		const [allowedEmojis, logChannelId, twemojiEnabled, ignoreChannels, ignoreReactionAdd, ignoreAllEvents, t] = await readSettings(
			data.guild,
			(settings) => [
				settings[GuildSettings.Selfmod.Reactions.Allowed],
				settings[key],
				settings[GuildSettings.Events.Twemoji],
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
			new MessageEmbed()
				.setColor(Colors.Green)
				.setAuthor({ name: `${user.tag} (${user.id})`, iconURL: user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }) })
				.setThumbnail(
					data.emoji.id === null
						? `https://twemoji.maxcdn.com/72x72/${twemoji(data.emoji.name!)}.png`
						: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}?size=64`
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

	public onUnload() {
		super.onUnload();
		if (this.kTimerSweeper) clearInterval(this.kTimerSweeper);
	}

	protected async retrieveCount(data: LLRCData, emoji: SerializedEmoji) {
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
		const users = (await api().channels(data.channel.id).messages(data.messageId).reactions(getEmojiReactionFormat(emoji)).get()) as APIUser[];
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
