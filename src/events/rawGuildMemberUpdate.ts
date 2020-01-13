import { AuditLogResult, WSGuildMemberUpdate } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MemberTag } from '@utils/Cache/MemberTags';
import { MessageLogsEnum } from '@utils/constants';
import { api } from '@utils/Models/Api';
import { floatPromise, getDisplayAvatar } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { Event, EventStore, KlasaGuild } from 'klasa';
import { Colors } from '@lib/types/constants/Constants';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'GUILD_MEMBER_UPDATE', emitter: store.client.ws });
	}

	public run(data: WSGuildMemberUpdate) {
		const guild = this.client.guilds.get(data.guild_id);
		if (typeof guild === 'undefined') return;

		const member = guild.members.get(data.user.id);
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2339
		if (typeof member !== 'undefined') member._patch(data);

		this.handleNicknameChange(guild, data);
		floatPromise(this, this.handleRoleSets(guild, data));
	}

	private handleNicknameChange(guild: KlasaGuild, data: WSGuildMemberUpdate) {
		// Get the current nickname, compare them both, if they are different, it changed
		const previous = guild.memberTags.get(data.user.id);
		const next: MemberTag = {
			nickname: data.nick || null,
			roles: data.roles
		};

		// Get the previous nickname
		guild.memberTags.set(data.user.id, next);

		// If the previous was unset or it's the same as the next one, skip
		if (typeof previous === 'undefined' || previous.nickname === next.nickname) return;

		// TODO(kyranet): Role Change Logs
		if (guild.settings.get(GuildSettings.Events.MemberNicknameUpdate)) {
			this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () => new MessageEmbed()
				.setColor(Colors.Yellow)
				.setAuthor(`${data.user.username}#${data.user.discriminator} (${data.user.id})`, getDisplayAvatar(data.user.id, data.user))
				.setDescription(guild.language.tget('EVENTS_NAME_DIFFERENCE', previous.nickname, next.nickname))
				.setFooter(guild.language.tget('EVENTS_NICKNAME_UPDATE'))
				.setTimestamp());
		}
	}

	private async handleRoleSets(guild: KlasaGuild, data: WSGuildMemberUpdate) {
		// Handle unique role sets
		let hasMultipleRolesInOneSet = false;
		const allRoleSets = guild.settings.get(GuildSettings.Roles.UniqueRoleSets);

		// First check if the user has multiple roles from a set
		for (const set of allRoleSets) {
			let hasOneRole = false;
			for (const id of set.roles) {
				if (!data.roles.includes(id)) continue;

				if (hasOneRole) {
					hasMultipleRolesInOneSet = true;
					break;
				} else {
					hasOneRole = true;
				}
			}
			// If we already know the member has multiple roles break the loop
			if (hasMultipleRolesInOneSet) break;
		}

		// If the user does not have multiple roles from any set cancel
		if (!hasMultipleRolesInOneSet) return;

		const auditLogs = await api(this.client).guilds(guild.id)['audit-logs'].get({
			query: {
				limit: 10,
				action_type: 25
			}
		}) as AuditLogResult;

		const entry = auditLogs.audit_log_entries.find(e => e.user_id !== this.client.user!.id
			&& e.target_id === data.user.id
			&& e.changes.find(c => c.key === '$add' && c.new_value.length));
		if (typeof entry === 'undefined') return;

		const change = entry.changes.find(c => c.key === '$add' && c.new_value.length)!;
		const updatedRoleID = change.new_value[0].id;
		let memberRoles = data.roles;
		for (const set of allRoleSets) {
			if (set.roles.includes(updatedRoleID)) memberRoles = memberRoles.filter(id => !set.roles.includes(id) || id === updatedRoleID);
		}

		await api(this.client).guilds(guild.id).members(data.user.id)
			.patch({ data: { roles: memberRoles }, reason: 'Automatic Role Group Modification' });
	}

}
