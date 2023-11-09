import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { Events } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.NotMutedMemberAdd })
export class UserListener extends Listener {
	public async run(member: GuildMember) {
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

		return writeSettings(member, [[GuildSettings.Roles.Initial, null]]);
	}
}
