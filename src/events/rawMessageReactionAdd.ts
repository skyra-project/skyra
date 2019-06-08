import { TextChannel } from 'discord.js';
import { WSMessageReactionAdd } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { LLRCData } from '../lib/util/LongLivingReactionCollector';
import { resolveEmoji } from '../lib/util/util';
import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'MESSAGE_REACTION_ADD', emitter: store.client.ws });
	}

	public async run(data: WSMessageReactionAdd): Promise<void> {
		const channel = this.client.channels.get(data.channel_id) as TextChannel;
		if (!channel || channel.type !== 'text' || !channel.readable) return;

		const parsed: LLRCData = {
			channel,
			emoji: {
				animated: data.emoji.animated,
				id: data.emoji.id,
				managed: 'managed' in data.emoji ? data.emoji.managed : null,
				name: data.emoji.name,
				requireColons: 'require_colons' in data.emoji ? data.emoji.require_colons : null,
				roles: data.emoji.roles || null,
				user: (data.emoji.user && this.client.users.add(data.emoji.user)) || { id: data.user_id }
			},
			guild: channel.guild,
			messageID: data.message_id,
			userID: data.user_id
		};

		for (const llrc of this.client.llrCollectors) {
			llrc.send(parsed);
		}

		this.client.emit(Events.RoleReactionAdd, parsed);

		if (!parsed.channel.nsfw
			&& parsed.channel.id !== channel.guild.settings.get(GuildSettings.Starboard.Channel)
			&& resolveEmoji(parsed.emoji) === channel.guild.settings.get(GuildSettings.Starboard.Emoji)) {
			try {
				await this.handleStarboard(parsed);
			} catch (error) {
				this.client.emit(Events.Wtf, error);
			}
		}
	}

	public async handleRoleChannel(parsed: LLRCData): Promise<void> {
		const messageReaction = parsed.guild.settings.get(GuildSettings.Roles.MessageReaction) as GuildSettings.Roles.MessageReaction;
		if (!messageReaction || messageReaction !== parsed.messageID) return;

		const emoji = resolveEmoji(parsed.emoji);
		if (!emoji) return;

		const roleEntry = (parsed.guild.settings.get(GuildSettings.Roles.Reactions) as GuildSettings.Roles.Reactions)
			.find(entry => entry.emoji === emoji);
		if (!roleEntry) return;

		try {
			const member = await parsed.guild.members.fetch(parsed.userID);
			if (member.roles.has(roleEntry.role)) return;

			const memberRoles = member.roles.map(r => r.id);
			const allRoleSets = member.guild.settings.get(GuildSettings.Roles.UniqueRoleSets) as GuildSettings.Roles.UniqueRoleSets;

			for (const set of allRoleSets) {
				if (!set.roles.includes(roleEntry.role)) continue;
				memberRoles.filter(id => !set.roles.includes(id));
			}

			memberRoles.push(roleEntry.role);

			await member.roles.set(memberRoles);
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}

	public async handleStarboard(parsed: LLRCData): Promise<void> {
		try {
			const channel = parsed.guild.settings.get(GuildSettings.Starboard.Channel) as GuildSettings.Starboard.Channel;
			const ignoreChannels = parsed.guild.settings.get(GuildSettings.Starboard.IgnoreChannels) as GuildSettings.Starboard.IgnoreChannels;
			if (!channel || ignoreChannels.includes(parsed.channel.id)) return;

			const starboardChannel = parsed.guild.channels.get(channel) as TextChannel;
			if (!starboardChannel || !starboardChannel.postable) {
				await parsed.guild.settings.reset(GuildSettings.Starboard.Channel);
				return;
			}

			// Process the starboard
			const { starboard } = parsed.guild;
			const sMessage = await starboard.fetch(parsed.channel, parsed.messageID, parsed.userID);
			if (sMessage) await sMessage.add(parsed.userID);
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}

}
