import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { GuildMember, MessageEmbed, User } from 'discord.js';
import { Event, Language, LanguageKeysComplex, LanguageKeysSimple } from 'klasa';

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
					this.buildEmbed(next.user, next.guild.language, 'eventsNameDifference', 'eventsNicknameUpdate', {
						previous: prevNickname,
						next: nextNickname
					})
				);
			}

			// Send the Username log
			const prevUsername = previous.user.username;
			const nextUserName = next.user.username;
			if (prevUsername !== nextUserName) {
				this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, next.guild, () =>
					this.buildEmbed(next.user, next.guild.language, 'eventsNameDifference', 'eventsUsernameUpdate', {
						previous: prevUsername,
						next: nextUserName
					})
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
				this.buildEmbed(next.user, next.guild.language, 'eventsRoleDifference', 'eventsRoleUpdate', { addedRoles, removedRoles })
			);
		}
	}

	private buildEmbed(user: User, i18n: Language, descriptionKey: LanguageKeysComplex, footerKey: LanguageKeysSimple, value: any) {
		return new MessageEmbed()
			.setColor(Colors.Yellow)
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setDescription(i18n.get(descriptionKey, value))
			.setFooter(i18n.get(footerKey))
			.setTimestamp();
	}
}
