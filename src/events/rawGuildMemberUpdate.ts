import { WSGuildMemberUpdate } from '../lib/types/DiscordAPI';
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
		});

		for (const entry of auditLogs.audit_log_entries) {
			if (entry.target_id !== member.id) continue;

			for (const change of entry.changes) {
				if (change.key !== '$add') continue;

				const updatedRoleID = change.new_value.id;
				const allRoleSets = guild.settings.get(GuildSettings.Roles.UniqueRoleSets) as GuildSettings.Roles.UniqueRoleSets;

				for (const set of allRoleSets) {
					if (!set.roles.includes(updatedRoleID)) continue;

					await member.roles.remove(set.roles.filter((id: string) => id !== updatedRoleID));

					// Once the first entry is found break out since we only want latest change
					break;
				}
			}

			// Break out after first is found because we only want the latest change
			break;
		}
	}

}
