import { readSettingsCached, writeSettings } from '#lib/database';
import { Listener } from '@sapphire/framework';
import type { Role } from 'discord.js';

export class UserListener extends Listener {
	public async run(previous: Role, next: Role) {
		if (!next.guild.available) return;
		if (previous.position === next.position) return;

		const settings = readSettingsCached(next);
		if (!settings?.permissionNodes.has(next.id)) return;

		await writeSettings(next, { permissionsRoles: settings.permissionNodes.refresh() });
	}
}
