import { Role } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(previous: Role, role: Role) {
		if (!role.guild.available) return;
		if (previous.position === role.position) return;
		// TODO(kyranet): check if the role is bound to a pnode as a condition
		return role.guild.writeSettings((settings) => settings.adders.refresh());
	}
}
