import { Event } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { Events } from '../lib/types/Enums';
import { resolveEmoji } from '../lib/util/util';
import { LLRCData } from '../lib/util/LongLivingReactionCollector';

export default class extends Event {

	public async run(parsed: LLRCData) {
		// Role reactions only apply on the roles channel
		const channelRoles = parsed.guild.settings.get(GuildSettings.Channels.Roles) as GuildSettings.Channels.Roles;
		if (!channelRoles) return;

		// There may be a message filter, or not, it could be applied to any message
		const messageReaction = parsed.guild.settings.get(GuildSettings.Roles.MessageReaction) as GuildSettings.Roles.MessageReaction;
		if (messageReaction && messageReaction !== parsed.messageID) return;

		// Resolve the emoji (since there can be many formats)
		const emoji = resolveEmoji(parsed.emoji);
		if (!emoji) return;

		const roleEntry = (parsed.guild.settings.get(GuildSettings.Roles.Reactions) as GuildSettings.Roles.Reactions)
			.find(entry => entry.emoji === emoji);
		if (!roleEntry) return;

		try {
			const member = await parsed.guild.members.fetch(parsed.userID);
			if (!member.roles.has(roleEntry.role)) await member.roles.add(roleEntry.role);
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}

}
