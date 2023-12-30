import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { Events } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { PermissionFlagsBits, type GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.NotMutedMemberAdd })
export class UserListener extends Listener {
	public async run(member: GuildMember) {
		// If the bot cannot manage roles, do not proceed:
		if (!this.canGiveRoles(member)) return;

		const [initial, initialHumans, initialBots] = await readSettings(member, [
			GuildSettings.Roles.Initial,
			GuildSettings.Roles.InitialHumans,
			GuildSettings.Roles.InitialBots
		]);
		if (!initial && !initialHumans && !initialBots) return;

		const roleId = initial ?? (member.user.bot ? initialBots : initialHumans);
		if (!roleId) return;

		const role = member.guild.roles.cache.get(roleId);
		if (role && role.position < member.guild.members.me!.roles.highest.position) {
			return member.roles.add(role);
		}

		const key = role //
			? GuildSettings.Roles.Initial
			: member.user.bot
				? GuildSettings.Roles.InitialBots
				: GuildSettings.Roles.InitialHumans;
		return writeSettings(member, [[key, null]]);
	}

	private canGiveRoles(member: GuildMember) {
		const permissions = member.guild.members.me?.permissions;
		return !isNullish(permissions) && permissions.has(PermissionFlagsBits.ManageRoles);
	}
}
