import { GuildSettings } from '#lib/database';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildMember } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.NotMutedMemberAdd })
export default class extends Event {
	public async run(member: GuildMember) {
		const roleID = await member.guild.readSettings(GuildSettings.Roles.Initial);
		if (!roleID) return;

		const role = member.guild.roles.cache.get(roleID);
		if (role && role.position < member.guild.me!.roles.highest.position) {
			return member.roles.add(role);
		}

		return member.guild.writeSettings([[GuildSettings.Roles.Initial, null]]);
	}
}
