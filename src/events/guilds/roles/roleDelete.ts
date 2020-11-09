import { Role } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(role: Role) {
		if (!role.guild.available) return;
		// TODO(kyranet): check if the role is bound to a pnode as a condition
		return role.guild.writeSettings((settings) => settings.adders.refresh());
	}
}
