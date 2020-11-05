import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { GuildMember } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ name: Events.NotMutedMemberAdd })
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
