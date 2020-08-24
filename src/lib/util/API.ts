import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { Guild, GuildMember, Permissions } from 'discord.js';

import { MemberTag } from './Cache/MemberTags';

export function canManage(guild: Guild, member: GuildMember) {
	if (guild.ownerID === member.id) return true;
	if (member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return true;

	const roleID = guild.settings.get(GuildSettings.Roles.Admin);
	const memberTag = guild.memberTags.get(member.id);

	// MemberTag must always exist:
	return (
		typeof memberTag !== 'undefined' &&
		// If Roles.Admin is not configured, check MANAGE_GUILD, else check if the member has the role.
		(roleID === null ? member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) : memberTag.roles.includes(roleID)) &&
		// Check if despite of having permissions, user permission nodes do not deny them.
		allowedPermissionsNodeUser(guild, member.id) &&
		// Check if despite of having permissions, role permission nodes do not deny them.
		allowedPermissionsNodeRole(guild, memberTag)
	);
}

export function allowedPermissionsNodeUser(guild: Guild, userID: string) {
	const permissionNodeRoles = guild.settings.get(GuildSettings.Permissions.Users);
	for (const node of permissionNodeRoles) {
		if (node.id !== userID) continue;
		if (node.allow.includes('conf')) return true;
		if (node.deny.includes('conf')) return false;
	}

	return true;
}

export function allowedPermissionsNodeRole(guild: Guild, memberTag: MemberTag) {
	// Assume sorted data
	for (const [id, node] of guild.permissionsManager.entries()) {
		if (!memberTag.roles.includes(id)) continue;
		if (node.allow.has('conf')) return true;
		if (node.deny.has('conf')) return false;
	}

	return true;
}
