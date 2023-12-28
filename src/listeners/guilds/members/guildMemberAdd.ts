import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import { floatPromise } from '#utils/common';
import { Colors } from '#utils/constants';
import { getStickyRoles } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { Listener } from '@sapphire/framework';
import { PermissionFlagsBits, type GuildMember } from 'discord.js';

export class UserListener extends Listener {
	public async run(member: GuildMember) {
		if (await this.handleStickyRoles(member)) return;
		this.container.client.emit(Events.NotMutedMemberAdd, member);
	}

	private async handleStickyRoles(member: GuildMember) {
		if (!member.guild.members.me!.permissions.has(PermissionFlagsBits.ManageRoles)) return false;

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
				new EmbedBuilder()
					.setColor(Colors.Amber)
					.setAuthor(getFullEmbedAuthor(member.user))
					.setDescription(
						t(LanguageKeys.Events.Guilds.Members.GuildMemberAddDescription, {
							mention: member.toString(),
							time: Date.now() - member.user.createdTimestamp
						})
					)
					.setFooter({ text: t(LanguageKeys.Events.Guilds.Members.GuildMemberAddMute) })
					.setTimestamp()
			);

			return true;
		}

		floatPromise(member.roles.add(stickyRoles));

		return false;
	}
}
