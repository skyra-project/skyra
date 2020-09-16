import { DiscordEvents } from '@lib/types/Events';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { CLIENT_ID } from '@root/config';
import { api } from '@utils/Models/Api';
import { floatPromise } from '@utils/util';
import { AuditLogEvent, GatewayGuildMemberUpdateDispatch, RESTGetAPIAuditLogQuery, RESTGetAPIAuditLogResult } from 'discord-api-types/v6';
import { Event, EventStore, KlasaGuild } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.GuildMemberUpdate, emitter: store.client.ws });
	}

	public run(data: GatewayGuildMemberUpdateDispatch['d']) {
		const guild = this.client.guilds.cache.get(data.guild_id);
		if (typeof guild === 'undefined') return;

		floatPromise(this, this.handleRoleSets(guild, data));
	}

	private async handleRoleSets(guild: KlasaGuild, data: Readonly<GatewayGuildMemberUpdateDispatch['d']>) {
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

		const query: RESTGetAPIAuditLogQuery = {
			limit: 10,
			action_type: AuditLogEvent.MEMBER_ROLE_UPDATE
		};
		const auditLogs = await api(this.client).guilds(guild.id)['audit-logs'].get<RESTGetAPIAuditLogResult>({
			query
		});

		const updatedRoleID = this.getChange(auditLogs, data.user!.id);
		if (updatedRoleID === null) return;

		let memberRoles = data.roles;
		for (const set of allRoleSets) {
			if (set.roles.includes(updatedRoleID)) memberRoles = memberRoles.filter((id) => !set.roles.includes(id) || id === updatedRoleID);
		}

		await api(this.client)
			.guilds(guild.id)
			.members(data.user!.id)
			.patch({ data: { roles: memberRoles }, reason: 'Automatic Role Group Modification' });
	}

	private getChange(results: RESTGetAPIAuditLogResult, userID: string): string | null {
		// Scan the audit logs.
		for (const result of results.audit_log_entries) {
			// If it was given by Skyra, continue.
			if (result.user_id === CLIENT_ID) continue;

			// If the target isn't the edited user, continue.
			if (result.target_id !== userID) continue;

			// If there are no changes, continue.
			if (typeof result.changes === 'undefined') continue;

			// Scan the changes.
			for (const change of result.changes) {
				if (change.key === '$add') return change.new_value![0].id;
			}
		}

		// No changes found.
		return null;
	}
}
