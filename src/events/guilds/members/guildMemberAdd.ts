import { GuildSettings } from '#lib/database';
import { Colors } from '#lib/types/constants/Constants';
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { MessageLogsEnum } from '#utils/constants';
import { floatPromise } from '#utils/util';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';
import { Event } from 'klasa';

const { FLAGS } = Permissions;

export default class extends Event {
	public async run(member: GuildMember) {
		if (await this.handleStickyRoles(member)) return;
		this.client.emit(Events.NotMutedMemberAdd, member);
	}

	private async handleStickyRoles(member: GuildMember) {
		if (!member.guild.me!.permissions.has(FLAGS.MANAGE_ROLES)) return false;

		const stickyRoles = await member.guild.stickyRoles.fetch(member.id);
		if (stickyRoles.length === 0) return false;

		// Handle the case the user is muted
		const [roleID, language] = await member.guild.readSettings((settings) => [settings[GuildSettings.Roles.Muted], settings.getLanguage()]);
		if (roleID && stickyRoles.includes(roleID)) {
			// Handle mute
			const role = member.guild.roles.cache.get(roleID);
			floatPromise(this, role ? member.roles.add(role) : member.guild.writeSettings([[GuildSettings.Roles.Muted, null]]));

			// Handle log
			this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, member.guild, () =>
				new MessageEmbed()
					.setColor(Colors.Amber)
					.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
					.setDescription(
						language.get(LanguageKeys.Events.GuildMemberAddDescription, {
							mention: member.toString(),
							time: Date.now() - member.user.createdTimestamp
						})
					)
					.setFooter(language.get(LanguageKeys.Events.GuildMemberAddMute))
					.setTimestamp()
			);

			return true;
		}

		floatPromise(this, member.roles.add(stickyRoles));

		return false;
	}
}
