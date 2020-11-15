import { GuildSettings } from '@lib/database';
import { isNullish } from '@lib/misc';
import { Guild, GuildMember, Permissions } from 'discord.js';

export async function canManage(guild: Guild, member: GuildMember) {
	if (guild.ownerID === member.id) return true;
	if (member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return true;

	const [roleID, pnodes] = await guild.readSettings((settings) => [settings[GuildSettings.Roles.Admin], settings.permissionNodes]);

	return (
		(isNullish(roleID) ? member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) : member.roles.cache.has(roleID)) &&
		// Run permission node checks
		(pnodes.run(member, 'conf') ?? false)
	);
}
