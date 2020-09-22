import { SkyraGuild } from '@lib/extensions/SkyraGuild';
import { GuildSettings, PermissionsNode } from '@lib/types/namespaces/GuildSettings';
import { getFromPath } from '@utils/util';
import { Event, Settings } from 'klasa';

export default class extends Event {
	public async run(settings: Settings, changes: Record<string, unknown>) {
		// If the synchronized settings isn't from the guilds gateway, return early.
		if (settings.gateway.name !== 'guilds') return;

		const guild = settings.target as SkyraGuild;
		this.updateFilter(guild, changes);
		await this.updatePermissionNodes(guild, changes);
	}

	private updateFilter(guild: SkyraGuild, changes: Record<string, unknown>) {
		const updated = getFromPath(changes, GuildSettings.Selfmod.Filter.Raw) as readonly string[] | undefined;
		if (typeof updated === 'undefined') return;

		if (updated.length) guild.security.updateRegExp(updated);
		else guild.security.regexp = null;
	}

	private updatePermissionNodes(guild: SkyraGuild, changes: Record<string, unknown>) {
		const updated = getFromPath(changes, GuildSettings.Permissions.Roles) as readonly PermissionsNode[] | undefined;
		if (typeof updated === 'undefined') return;

		return guild.permissionsManager.update(updated);
	}
}
