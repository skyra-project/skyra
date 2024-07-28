import { readSettingsCached, readSettingsPermissionNodes, writeSettings } from '#lib/database';
import { Listener } from '@sapphire/framework';
import type { Role } from 'discord.js';

export class UserListener extends Listener {
	public async run(previous: Role, next: Role) {
		if (!next.guild.available) return;
		if (previous.position === next.position) return;

		const settings = readSettingsCached(next);
		if (!settings) return;

		const nodes = readSettingsPermissionNodes(settings);
		if (!nodes.has(next.id)) return;

		await writeSettings(next, { permissionsRoles: nodes.refresh(settings) });
	}
}
