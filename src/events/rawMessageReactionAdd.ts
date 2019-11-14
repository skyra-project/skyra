import { TextChannel, MessageEmbed } from 'discord.js';
import { WSMessageReactionAdd } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { LLRCData } from '../lib/util/LongLivingReactionCollector';
import { resolveEmoji, floatPromise, getDisplayAvatar, twemoji } from '../lib/util/util';
import { Event, EventStore } from 'klasa';
import { MessageLogsEnum, APIErrors } from '../lib/util/constants';
import { api } from '../lib/util/Models/Api';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_REACTION_ADD', emitter: store.client.ws });
	}

	public run(raw: WSMessageReactionAdd) {
		const channel = this.client.channels.get(raw.channel_id) as TextChannel | undefined;
		if (!channel || channel.type !== 'text' || !channel.readable) return;

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
		if (data.channel.guild.settings.get(GuildSettings.Selfmod.Reactions.WhiteList).includes(emoji)) return;

		floatPromise(this, this.handleReactionBlacklist(data, emoji));
		if (!data.channel.guild.settings.get(GuildSettings.Channels.ReactionLogs)) return;

		const userTag = await this.client.userTags.fetch(data.userID);
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Reaction, data.channel.guild, () => new MessageEmbed()
			.setColor(0xFFAB40)
			.setAuthor(`${userTag.username}#${userTag.discriminator} (${data.userID})`, getDisplayAvatar(data.userID, userTag))
			.setThumbnail(data.emoji.id === null
				? `https://twemoji.maxcdn.com/2/72x72/${twemoji(data.emoji.name)}.png`
				: `https://cdn.discordapp.com/emojis/${data.emoji.id}.${data.emoji.animated ? 'gif' : 'png'}`)
			.setDescription(`[${data.guild.language.tget('JUMPTO')}](https://discordapp.com/channels/${data.guild.id}/${data.channel.id}/${data.messageID})`)
			.setFooter(`${data.channel.guild.language.tget('EVENTS_REACTION')} • ${data.channel.name}`)
			.setTimestamp());
	}

	private async handleReactionBlacklist(data: LLRCData, emoji: string) {
		if (!data.channel.guild.settings.get(GuildSettings.Selfmod.Reactions.BlackList).includes(emoji)) return;

		try {
			await api(this.client).channels(data.channel.id)
				.messages(data.messageID)
				.reactions(emoji, data.userID)
				.delete({ reason: '[MODERATION] Automatic Removal of Blacklisted Emoji.' });
		} catch (error) {
			if (error.code === APIErrors.UnknownMessage) return;
			this.client.emit(Events.Wtf, error);
		}
	}

	private async handleStarboard(data: LLRCData, emoji: string) {
		if (data.channel.nsfw
			|| data.channel.id === data.channel.guild.settings.get(GuildSettings.Starboard.Channel)
			|| emoji !== data.channel.guild.settings.get(GuildSettings.Starboard.Emoji)) return;

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

}
