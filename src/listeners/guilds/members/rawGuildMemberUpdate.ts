import { readSettings } from '#lib/database';
import { api } from '#lib/discord/Api';
import { floatPromise } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import {
	AuditLogEvent,
	GatewayDispatchEvents,
	PermissionFlagsBits,
	type GatewayGuildMemberUpdateDispatchData,
	type Guild,
	type RESTGetAPIAuditLogResult
} from 'discord.js';

type GatewayData = Readonly<GatewayGuildMemberUpdateDispatchData>;

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.GuildMemberUpdate, emitter: 'ws' })
export class UserListener extends Listener {
	private readonly requiredPermissions = PermissionFlagsBits.ViewAuditLog;

	public run(data: GatewayData) {
		const guild = this.container.client.guilds.cache.get(data.guild_id);

		// If the guild does not exist for some reason, skip:
		if (isNullish(guild)) return;

		// If the bot doesn't have the required permissions, skip:
		if (!guild.members.me?.permissions.has(this.requiredPermissions)) return;

		floatPromise(this.handleRoleSets(guild, data));
	}

	private async handleRoleSets(guild: Guild, data: GatewayData) {
		// Handle unique role sets
		let hasMultipleRolesInOneSet = false;
		const settings = await readSettings(guild);
		const allRoleSets = settings.rolesUniqueRoleSets;

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

		const auditLogs = await api().guilds.getAuditLogs(guild.id, {
			limit: 10,
			action_type: AuditLogEvent.MemberRoleUpdate
		});

		const updatedRoleId = this.getChange(auditLogs, data.user!.id);
		if (updatedRoleId === null) return;

		let memberRoles = data.roles;
		for (const set of allRoleSets) {
			if (set.roles.includes(updatedRoleId)) memberRoles = memberRoles.filter((id) => !set.roles.includes(id) || id === updatedRoleId);
		}

		await api().guilds.editMember(guild.id, data.user.id, { roles: memberRoles }, { reason: 'Automatic Role Set Modification' });
	}

	private getChange(results: RESTGetAPIAuditLogResult, userId: string): string | null {
		// Scan the audit logs.
		for (const result of results.audit_log_entries) {
			// If it was given by Skyra, continue.
			if (result.user_id === process.env.CLIENT_ID) continue;

			// If the target isn't the edited user, continue.
			if (result.target_id !== userId) continue;

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
