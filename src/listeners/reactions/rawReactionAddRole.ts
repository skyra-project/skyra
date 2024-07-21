import { readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import type { LLRCData } from '#utils/LongLivingReactionCollector';
import { resolveEmojiId, sendTemporaryMessage, type SerializedEmoji } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { DiscordAPIError } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.RawReactionAdd })
export class UserListener extends Listener {
	public async run(data: LLRCData, emoji: SerializedEmoji) {
		const emojiId = resolveEmojiId(emoji);

		const settings = await readSettings(data.guild);
		const roleEntry = settings.reactionRoles.find(
			(entry) =>
				resolveEmojiId(entry.emoji) === emojiId &&
				entry.channel === data.channel.id &&
				(entry.message ? entry.message === data.messageId : true)
		);
		if (!roleEntry) return;

		const allRoleSets = settings.rolesUniqueRoleSets;

		try {
			const member = await data.guild.members.fetch(data.userId);
			if (member.roles.cache.has(roleEntry.role)) return;

			// Convert the array into a set
			const memberRoles = new Set(member.roles.cache.keys());
			// Remove the everyone role from the set
			memberRoles.delete(data.guild.id);

			for (const set of allRoleSets) {
				// If the set doesn't have the role being added to the user skip
				if (!set.roles.includes(roleEntry.role)) continue;
				// For every role that the user has check if it is in this set and remove it
				for (const id of memberRoles) if (set.roles.includes(id)) memberRoles.delete(id);
			}

			// Add the role to the set that the user has gained
			memberRoles.add(roleEntry.role);
			// Set all the roles at once.
			await member.roles.set([...memberRoles]);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === 50013) {
				const message = await data.channel.messages.fetch(data.messageId);
				await sendTemporaryMessage(message, await resolveKey(message, LanguageKeys.Events.Reactions.SelfRoleHierarchy));
			} else {
				this.container.client.emit(Events.Error, error);
			}
		}
	}
}
