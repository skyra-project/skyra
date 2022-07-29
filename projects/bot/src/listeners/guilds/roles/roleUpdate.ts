import { writeSettings } from '#lib/database';
import { Listener } from '@sapphire/framework';
import type { Role } from 'discord.js';

export class UserListener extends Listener {
	public run(previous: Role, next: Role) {
		if (!next.guild.available) return;
		if (previous.position === next.position) return;
		if (!this.container.settings.guilds.get(next.guild.id)?.permissionNodes.has(next.id)) return;
		return writeSettings(next, (settings) => settings.adders.refresh());
	}
}
