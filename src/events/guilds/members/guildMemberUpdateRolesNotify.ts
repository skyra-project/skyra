import { GuildSettings } from '@lib/database';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { MessageLogsEnum } from '@utils/constants';
import { GuildMember, MessageEmbed } from 'discord.js';
import { Event, EventOptions, Language } from 'klasa';

@ApplyOptions<EventOptions>({ name: Events.GuildMemberUpdate })
export default class extends Event {
	public async run(previous: GuildMember, next: GuildMember) {
		const [enabled, language] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Events.MemberRoleUpdate],
			settings.getLanguage()
		]);

		if (!enabled) return;

		// Retrieve whether or not role logs should be sent from Guild Settings and
		// whether or not the roles are the same.
		const prevRoles = previous.roles.cache;
		const nextRoles = next.roles.cache;
		if (prevRoles.equals(nextRoles)) return;

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

		const { user } = next;

		// Set the Role change log
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, next.guild, () =>
			new MessageEmbed()
				.setColor(Colors.Yellow)
				.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setDescription(this.getRoleDescription(language, addedRoles, removedRoles) || language.get(LanguageKeys.Events.GuildMemberNoUpdate))
				.setFooter(language.get(LanguageKeys.Events.RoleUpdate))
				.setTimestamp()
		);
	}

	private getRoleDescription(i18n: Language, addedRoles: string[], removedRoles: string[]) {
		const description = [];
		if (addedRoles.length) {
			description.push(
				i18n.get(addedRoles.length === 1 ? LanguageKeys.Events.GuildMemberAddedRoles : LanguageKeys.Events.GuildMemberAddedRolesPlural, {
					addedRoles: i18n.list(addedRoles, i18n.get(LanguageKeys.Globals.And))
				})
			);
		}

		if (removedRoles.length) {
			description.push(
				i18n.get(
					removedRoles.length === 1 ? LanguageKeys.Events.GuildMemberRemovedRoles : LanguageKeys.Events.GuildMemberRemovedRolesPlural,
					{
						removedRoles: i18n.list(removedRoles, i18n.get(LanguageKeys.Globals.And))
					}
				)
			);
		}

		return description.join('\n');
	}
}
