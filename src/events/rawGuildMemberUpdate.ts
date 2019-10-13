import { WSGuildMemberUpdate, AuditLogResult } from '../lib/types/DiscordAPI';
import { Event, EventStore } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { api } from '../lib/util/Models/Api';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'GUILD_MEMBER_UPDATE', emitter: store.client.ws });
	}

	public async run(data: WSGuildMemberUpdate): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild) return;

		guild!.memberSnowflakes.add(data.user.id);
		this.client.usertags.set(data.user.id, `${data.user.username}#${data.user.discriminator}`);
		const member = await guild!.members.fetch(data.user.id).catch(() => null);
		if (!member) return;
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2339
		if (member) member._patch(data);

		// Handle unique role sets
		let hasMultipleRolesInOneSet = false;
		const allRoleSets = guild!.settings.get(GuildSettings.Roles.UniqueRoleSets);

		// First check if the user has multiple roles from a set
		for (const set of allRoleSets) {
			let hasOneRole = false;
			for (const id of set.roles) {
				if (!member.roles.has(id)) continue;

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

		const auditLogs = await api(this.client).guilds(data.guild_id)['audit-logs'].get({
			query: {
				limit: 10,
				action_type: 25
			}
		}) as AuditLogResult;

		const entry = auditLogs.audit_log_entries.find(e => e.user_id !== this.client.user!.id && e.target_id === data.user.id && e.changes.find(c => c.key === '$add' && c.new_value.length));
		if (!entry) return;

		const change = entry.changes.find(c => c.key === '$add' && c.new_value.length)!;
		const updatedRoleID = change.new_value[0].id;
		console.log('the raw event reached the member set');
		let memberRoles = member.roles.map(role => role.id);
		for (const set of allRoleSets) {
			if (!set.roles.includes(updatedRoleID)) continue;

			memberRoles = memberRoles.filter(id => !set.roles.includes(id) || id === updatedRoleID);
		}

		await member.roles.set(memberRoles);
	}

}
