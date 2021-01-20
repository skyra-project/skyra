import type { Role } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(role: Role) {
		if (!role.guild.available) return;
		if (!role.client.settings.guilds.get(role.guild.id)?.permissionNodes.has(role.id)) return;
		return role.guild.writeSettings((settings) => settings.adders.refresh());
	}
}
