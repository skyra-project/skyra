import { Role } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(_oldRole: Role, newRole: Role) {
		return newRole.guild.available ? newRole.guild.permissionsManager.update() : null;
	}
}
