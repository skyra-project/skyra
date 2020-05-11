import { WSMessageReactionRemove } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { resolveEmoji } from '@utils/util';
import { TextChannel } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {

	public async run(channel: TextChannel, data: WSMessageReactionRemove) {
		// If the channel is not a text channel then stop processing
		if (channel.type !== 'text') return;
		// Role reactions only apply on the roles channel
		const channelRoles = channel.guild.settings.get(GuildSettings.Channels.Roles);
		if (!channelRoles) return;

		// There may be a message filter, or not, it could be applied to any message
		const messageReaction = channel.guild.settings.get(GuildSettings.Roles.MessageReaction);
		if (messageReaction && messageReaction !== data.message_id) return;

		const parsed = resolveEmoji(data.emoji);
		if (!parsed) return;

		const roleEntry = channel.guild.settings.get(GuildSettings.Roles.Reactions)
			.find(entry => entry.emoji === parsed);
		if (!roleEntry) return;

		try {
			const member = await channel.guild.members.fetch(data.user_id);
			if (member.roles.has(roleEntry.role)) await member.roles.remove(roleEntry.role);
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}

}
