import Collection from '@discordjs/collection';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { MessageLogsEnum } from '@utils/constants';
import { LLRCData } from '@utils/LongLivingReactionCollector';
import { twemoji } from '@utils/util';
import { APIUser } from 'discord-api-types/v6';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Event, EventOptions } from 'klasa';
import { api } from '@utils/Models/Api';

@ApplyOptions<EventOptions>({ name: Events.RawReactionAdd })
export default class extends Event {
	private readonly kCountCache = new Collection<string, InternalCacheEntry>();
	private readonly kSyncCache = new Collection<string, Promise<InternalCacheEntry>>();
	private kTimerSweeper: NodeJS.Timer | null = null;

	public async run(data: LLRCData, emoji: string) {
		if (data.guild.settings.get(GuildSettings.Selfmod.Reactions.WhiteList).includes(emoji)) return;

		this.client.emit(Events.ReactionBlacklist, data, emoji);
		if (
			!data.guild.settings.get(GuildSettings.Channels.ReactionLogs) ||
			(!data.guild.settings.get(GuildSettings.Events.Twemoji) && data.emoji.id === null)
		)
			return;

		const ignoreChannels = data.guild.settings.get(GuildSettings.Messages.IgnoreChannels);
		const ignoreReactionAdd = data
			.guild!.settings.get(GuildSettings.Channels.Ignore.ReactionAdd)
			.some((id) => data.channel.id === id || (data.channel as TextChannel).parent?.id === id);
		const ignoreAllEvents = data
			.guild!.settings.get(GuildSettings.Channels.Ignore.All)
			.some((id) => data.channel.id === id || (data.channel as TextChannel).parent?.id === id);
		if (ignoreChannels.includes(data.channel.id) || ignoreReactionAdd || ignoreAllEvents) return;

		if ((await this.retrieveCount(data, emoji)) > 1) return;

		const user = await this.client.users.fetch(data.userID);
		if (user.bot) return;

		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Reaction, data.guild, () =>
			new MessageEmbed()
				.setColor(Colors.Green)
				.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setThumbnail(
					data.emoji.id === null
						? `https://twemoji.maxcdn.com/72x72/${twemoji(data.emoji.name!)}.png`
						: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}?size=64`
				)
				.setDescription(
					[
						`**Emoji**: ${data.emoji.name}${data.emoji.id === null ? '' : ` [${data.emoji.id}]`}`,
						`**Channel**: ${data.channel}`,
						`**Message**: [${data.guild.language.get(LanguageKeys.Misc.JumpTo)}](https://discord.com/channels/${data.guild.id}/${
							data.channel.id
						}/${data.messageID})`
					].join('\n')
				)
				.setFooter(`${data.guild.language.get(LanguageKeys.Events.Reaction)} • ${data.channel.name}`)
				.setTimestamp()
		);
	}

	protected async retrieveCount(data: LLRCData, emoji: string) {
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
		const users = (await api(this.client).channels(data.channel.id).messages(data.messageID).reactions(emoji).get()) as APIUser[];
		const count: InternalCacheEntry = { count: users.length, sweepAt: Date.now() + 120000 };
		this.kCountCache.set(id, count);
		this.kSyncCache.delete(id);

		if (this.kTimerSweeper === null) {
			this.kTimerSweeper = this.client.setInterval(() => {
				const now = Date.now();
				this.kCountCache.sweep((entry) => entry.sweepAt < now);
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
