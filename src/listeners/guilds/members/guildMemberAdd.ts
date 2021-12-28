import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types/Enums';
import { floatPromise } from '#utils/common';
import { Colors } from '#utils/constants';
import { getStickyRoles } from '#utils/functions';
import { Listener } from '@sapphire/framework';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';

const { FLAGS } = Permissions;

export class UserListener extends Listener {
	public async run(member: GuildMember) {
		if (await this.handleStickyRoles(member)) return;
		this.container.client.emit(Events.NotMutedMemberAdd, member);
	}

	private async handleStickyRoles(member: GuildMember) {
		if (!member.guild.me!.permissions.has(FLAGS.MANAGE_ROLES)) return false;

		const stickyRoles = await getStickyRoles(member).fetch(member.id);
		if (stickyRoles.length === 0) return false;

		// Handle the case the user is muted
		const key = GuildSettings.Channels.Logs.MemberAdd;
		const [logChannelId, roleId, t] = await readSettings(member, (settings) => [
			settings[key],
			settings[GuildSettings.Roles.Muted],
			settings.getLanguage()
		]);
		if (roleId && stickyRoles.includes(roleId)) {
			// Handle mute
			const role = member.guild.roles.cache.get(roleId);
			floatPromise(role ? member.roles.add(role) : writeSettings(member, [[GuildSettings.Roles.Muted, null]]));

			// Handle log
			this.container.client.emit(Events.GuildMessageLog, member.guild, logChannelId, key, () =>
				new MessageEmbed()
					.setColor(Colors.Amber)
					.setAuthor({
						name: `${member.user.tag} (${member.user.id})`,
						iconURL: member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
					})
					.setDescription(
						t(LanguageKeys.Events.Guilds.Members.GuildMemberAddDescription, {
							mention: member.toString(),
							time: Date.now() - member.user.createdTimestamp
						})
					)
					.setFooter(t(LanguageKeys.Events.Guilds.Members.GuildMemberAddMute))
					.setTimestamp()
			);

			return true;
		}

		floatPromise(member.roles.add(stickyRoles));

		return false;
	}
}
