import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { LLRCData } from '@utils/LongLivingReactionCollector';
import { resolveEmoji } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public async run(parsed: LLRCData) {
		// Resolve the emoji (since there can be many formats)
		const emoji = resolveEmoji(parsed.emoji);
		if (!emoji) return;

		const roleEntry = parsed.guild.settings
			.get(GuildSettings.ReactionRoles)
			.find(
				(entry) => entry.emoji === emoji && entry.channel === parsed.channel.id && (entry.message ? entry.message === parsed.messageID : true)
			);
		if (!roleEntry) return;

		try {
			const member = await parsed.guild.members.fetch(parsed.userID);
			if (member.roles.cache.has(roleEntry.role)) return;

			// Conver the array into a set
			const memberRoles = new Set(member.roles.cache.keys());
			// Remove the eveeryone role from the set
			memberRoles.delete(parsed.guild.id);

			const allRoleSets = member.guild.settings.get(GuildSettings.Roles.UniqueRoleSets);

			for (const set of allRoleSets) {
				// If the set doesnt have the role being added to the user skip
				if (!set.roles.includes(roleEntry.role)) continue;
				// For every role that the user has check if it is in this set and remove it
				for (const id of memberRoles) if (set.roles.includes(id)) memberRoles.delete(id);
			}

			// Add the role to the set that the user has gained
			memberRoles.add(roleEntry.role);
			// Set all the roles at once.
			await member.roles.set([...memberRoles]);
		} catch (error) {
			this.client.emit(Events.ApiError, error);
		}
	}
}
