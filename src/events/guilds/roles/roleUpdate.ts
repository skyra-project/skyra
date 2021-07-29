import { writeSettings } from '#lib/database';
import { Event } from '@sapphire/framework';
import type { Role } from 'discord.js';

export class UserEvent extends Event {
	public run(previous: Role, next: Role) {
		if (!next.guild.available) return;
		if (previous.position === next.position) return;
		if (!this.context.settings.guilds.get(next.guild.id)?.permissionNodes.has(next.id)) return;
		return writeSettings(next, (settings) => settings.adders.refresh());
	}
}
