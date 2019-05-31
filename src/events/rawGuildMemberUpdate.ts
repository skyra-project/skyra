import { WSGuildMemberUpdate, AuditLogResult, AuditLogEntry, Change } from '../lib/types/DiscordAPI';
import { Event, EventStore } from 'klasa';
import { GuildSettings } from '../lib/types/settings/GuildSettings';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'GUILD_MEMBER_UPDATE', emitter: store.client.ws });
	}

	public async run(data: WSGuildMemberUpdate): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild) return;

		guild.memberSnowflakes.add(data.user.id);
		this.client.usertags.set(data.user.id, `${data.user.username}#${data.user.discriminator}`);
		const member = guild.members.get(data.user.id);
		// @ts-ignore
		if (member) member._patch(data);

		// Handle unique role sets
		const auditLogs = await (this.client as any).api.guilds(data.guild_id, 'audit-logs').get({
			query: {
				limit: 10,
				action_type: 25
			}
		}) as AuditLogResult;

		const entry = auditLogs.audit_log_entries.find(e => e.target_id === member.id && e.changes.find(c => c.key === '$add'));
		if (!entry) return;

		const change = entry.changes.find(c => c.key === '$add' && c.new_value.length);
		const updatedRoleID = change.new_value[0].id;
		const allRoleSets = guild.settings.get(GuildSettings.Roles.UniqueRoleSets) as GuildSettings.Roles.UniqueRoleSets;

		for (const set of allRoleSets) {
			if (!set.roles.includes(updatedRoleID)) continue;

			await member.roles.remove(set.roles.filter((id: string) => id !== updatedRoleID));
		}
	}

}
