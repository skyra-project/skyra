import Collection from '@discordjs/collection';
import { Colors } from '@lib/types/constants/Constants';
import { APIUserData, WSMessageReactionAdd } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { LLRCData } from '@utils/LongLivingReactionCollector';
import { api } from '@utils/Models/Api';
import { floatPromise, getDisplayAvatar, isTextBasedChannel, resolveEmoji, twemoji } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {

	private readonly kCountCache = new Collection<string, InternalCacheEntry>();
	private readonly kSyncCache = new Collection<string, Promise<InternalCacheEntry>>();
	private kTimerSweeper: NodeJS.Timer | null = null;

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_REACTION_ADD', emitter: store.client.ws });
	}

	public run(raw: WSMessageReactionAdd) {
		const channel = this.client.channels.get(raw.channel_id) as TextChannel | undefined;
		if (!channel || !isTextBasedChannel(channel) || !channel.readable) return;

		const data: LLRCData = {
			channel,
			emoji: {
				animated: raw.emoji.animated,
				id: raw.emoji.id,
				managed: 'managed' in raw.emoji ? raw.emoji.managed! : null,
				name: raw.emoji.name,
				requireColons: 'require_colons' in raw.emoji ? raw.emoji.require_colons! : null,
				roles: raw.emoji.roles || null,
				user: (raw.emoji.user && this.client.users.add(raw.emoji.user)) || { id: raw.user_id }
			},
			guild: channel.guild,
			messageID: raw.message_id,
			userID: raw.user_id
		};

		for (const llrc of this.client.llrCollectors) {
			llrc.send(data);
		}

		this.client.emit(Events.RoleReactionAdd, data);

		const emoji = resolveEmoji(data.emoji);
		if (emoji === null) return;

		floatPromise(this, this.handleReactionLogs(data, emoji));
		floatPromise(this, this.handleStarboard(data, emoji));
	}

	private async handleReactionLogs(data: LLRCData, emoji: string) {
		if (data.guild.settings.get(GuildSettings.Selfmod.Reactions.WhiteList).includes(emoji)) return;

		this.client.emit(Events.ReactionBlacklist, data, emoji);
		if (!data.guild.settings.get(GuildSettings.Channels.ReactionLogs)
			|| (!data.guild.settings.get(GuildSettings.Events.Twemoji) && data.emoji.id === null)
		) return;

		if (await this.retrieveCount(data, emoji) > 1) return;

		const userTag = await this.client.userTags.fetch(data.userID);
		if (userTag.bot) return;

		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Reaction, data.guild, () => new MessageEmbed()
			.setColor(Colors.Green)
			.setAuthor(`${userTag.username}#${userTag.discriminator} (${data.userID})`, getDisplayAvatar(data.userID, userTag))
			.setThumbnail(data.emoji.id === null
				? `https://twemoji.maxcdn.com/v/12.1.4/72x72/${twemoji(data.emoji.name)}.png`
				: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}?size=64`)
			.setDescription([
				`**Emoji**: ${data.emoji.name}${data.emoji.id === null ? '' : ` [${data.emoji.id}]`}`,
				`**Channel**: ${data.channel}`,
				`**Message**: [${data.guild.language.tget('JUMPTO')}](https://discordapp.com/channels/${data.guild.id}/${data.channel.id}/${data.messageID})`
			].join('\n'))
			.setFooter(`${data.guild.language.tget('EVENTS_REACTION')} • ${data.channel.name}`)
			.setTimestamp());
	}

	private async handleStarboard(data: LLRCData, emoji: string) {
		if (data.channel.nsfw
			|| data.channel.id === data.guild.settings.get(GuildSettings.Starboard.Channel)
			|| emoji !== data.guild.settings.get(GuildSettings.Starboard.Emoji)) return;

		try {
			const channel = data.guild.settings.get(GuildSettings.Starboard.Channel);
			const ignoreChannels = data.guild.settings.get(GuildSettings.Starboard.IgnoreChannels);
			if (!channel || ignoreChannels.includes(data.channel.id)) return;

			const starboardChannel = data.guild.channels.get(channel) as TextChannel | undefined;
			if (typeof starboardChannel === 'undefined' || !starboardChannel.postable) {
				await data.guild.settings.reset(GuildSettings.Starboard.Channel);
				return;
			}

			// Process the starboard
			const { starboard } = data.guild;
			const sMessage = await starboard.fetch(data.channel, data.messageID, data.userID);
			if (sMessage) await sMessage.add(data.userID);
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}

	private async retrieveCount(data: LLRCData, emoji: string) {
		const id = `${data.messageID}.${emoji}`;

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

	private async fetchCount(data: LLRCData, emoji: string, id: string) {
		const users = await api(this.client)
			.channels(data.channel.id)
			.messages(data.messageID)
			.reactions(emoji)
			.get() as APIUserData[];
		const count: InternalCacheEntry = { count: users.length, sweepAt: Date.now() + 120000 };
		this.kCountCache.set(id, count);
		this.kSyncCache.delete(id);

		if (this.kTimerSweeper === null) {
			this.kTimerSweeper = this.client.setInterval(() => {
				const now = Date.now();
				this.kCountCache.sweep(entry => entry.sweepAt < now);
				if (this.kTimerSweeper !== null && this.kCountCache.size === 0) {
					this.client.clearInterval(this.kTimerSweeper);
					this.kTimerSweeper = null;
				}
			}, 5000);
		}

		return count;
	}

}

interface InternalCacheEntry {
	sweepAt: number;
	count: number;
}
