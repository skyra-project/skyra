import { Role } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(_: Role, role: Role) {
		return role.guild.available ? role.guild.permissionsManager.update() : null;
	}
}
