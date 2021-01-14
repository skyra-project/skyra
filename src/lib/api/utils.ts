import { GuildSettings } from '#lib/database';
import { hasAtLeastOneKeyInMap } from '#utils/comparators';
import { Guild, GuildMember, Permissions } from 'discord.js';

function isAdmin(member: GuildMember, roles: readonly string[]): boolean {
	return roles.length === 0 ? member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) : hasAtLeastOneKeyInMap(member.roles.cache, roles);
}

export async function canManage(guild: Guild, member: GuildMember) {
	if (guild.ownerID === member.id) return true;
	if (member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return true;

	const [roles, pnodes] = await guild.readSettings((settings) => [settings[GuildSettings.Roles.Admin], settings.permissionNodes]);

	return isAdmin(member, roles) && (pnodes.run(member, 'conf') ?? false);
}
