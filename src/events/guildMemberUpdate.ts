import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { GuildMember, MessageEmbed, User } from 'discord.js';
import { Event, Language, LanguageKeysSimple } from 'klasa';

export default class extends Event {
	public run(previous: GuildMember, next: GuildMember) {
		// Retrieve whether or not nickname logs should be sent from Guild Settings and
		// whether or not the nicknames are identical.
		if (next.guild.settings.get(GuildSettings.Events.MemberNicknameUpdate)) {
			// Send the Nickname log
			const prevNickname = previous.nickname;
			const nextNickname = next.nickname;
			if (prevNickname !== nextNickname) {
				this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, next.guild, () =>
					this.buildEmbed(
						next.user,
						next.guild.language,
						this.getNameDescription(next.guild.language, prevNickname, nextNickname),
						'eventsNicknameUpdate'
					)
				);
			}
		}

		// Retrieve whether or not role logs should be sent from Guild Settings and
		// whether or not the roles are the same.
		const prevRoles = previous.roles.cache;
		const nextRoles = next.roles.cache;
		if (next.guild.settings.get(GuildSettings.Events.MemberRoleUpdate) && !prevRoles.equals(nextRoles)) {
			const addedRoles: string[] = [];
			const removedRoles: string[] = [];

			// Check which roles are added and which are removed and
			// get the names of each role for logging
			for (const [key, role] of nextRoles.entries()) {
				if (!prevRoles.has(key)) addedRoles.push(`\`${role.name}\``);
			}

			for (const [key, role] of prevRoles.entries()) {
				if (!nextRoles.has(key)) removedRoles.push(`\`${role.name}\``);
			}

			// Set the Role change log
			this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, next.guild, () =>
				this.buildEmbed(
					next.user,
					next.guild.language,
					this.getRoleDescription(next.guild.language, addedRoles, removedRoles),
					'eventsRoleUpdate'
				)
			);
		}
	}

	private getRoleDescription(i18n: Language, addedRoles: string[], removedRoles: string[]) {
		const description = [];
		if (addedRoles.length) {
			description.push(
				i18n.get(addedRoles.length === 1 ? 'eventsGuildMemberAddedRoles' : 'eventsGuildMemberAddedRolesPlural', {
					addedRoles: i18n.list(addedRoles, i18n.get('globalAnd'))
				})
			);
		}
		if (removedRoles.length) {
			description.push(
				i18n.get(removedRoles.length === 1 ? 'eventsGuildMemberRemovedRoles' : 'eventsGuildMemberRemovedRolesPlural', {
					removedRoles: i18n.list(removedRoles, i18n.get('globalAnd'))
				})
			);
		}
		return description.join('\n');
	}

	private getNameDescription(i18n: Language, previousName: string | null, nextName: string | null) {
		return [
			i18n.get(previousName === null ? 'eventsNameUpdatePreviousWasNotSet' : 'eventsNameUpdatePreviousWasSet', { previousName }),
			i18n.get(nextName === null ? 'eventsNameUpdateNextWasNotSet' : 'eventsNameUpdateNextWasSet', { nextName })
		].join('\n');
	}

	private buildEmbed(
		user: User,
		i18n: Language,
		description: string,
		footerKey: Extract<LanguageKeysSimple, 'eventsNicknameUpdate' | 'eventsRoleUpdate'>
	) {
		return new MessageEmbed()
			.setColor(Colors.Yellow)
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(description || i18n.get('eventsGuildMemberNoUpdate'))
			.setFooter(i18n.get(footerKey))
			.setTimestamp();
	}
}
