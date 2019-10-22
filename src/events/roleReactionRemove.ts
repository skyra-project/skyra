import { Event } from 'klasa';
import { TextChannel } from 'discord.js';
import { WSMessageReactionRemove } from '../lib/types/DiscordAPI';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { Events } from '../lib/types/Enums';
import { resolveEmoji } from '../lib/util/util';

export default class extends Event {

	public async run(channel: TextChannel, data: WSMessageReactionRemove) {
		// Role reactions only apply on the roles channel
		const channelRoles = channel.guild!.settings.get(GuildSettings.Channels.Roles);
		if (!channelRoles) return;

		// There may be a message filter, or not, it could be applied to any message
		const messageReaction = channel.guild!.settings.get(GuildSettings.Roles.MessageReaction);
		if (messageReaction && messageReaction !== data.message_id) return;

		const parsed = resolveEmoji(data.emoji);
		if (!parsed) return;

		const roleEntry = channel.guild!.settings.get(GuildSettings.Roles.Reactions)
			.find(entry => entry.emoji === parsed);
		if (!roleEntry) return;

		try {
			const member = await channel.guild!.members.fetch(data.user_id);
			if (member.roles.has(roleEntry.role)) await member.roles.remove(roleEntry.role);
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}

}
