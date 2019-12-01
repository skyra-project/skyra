import { Event, Settings } from 'klasa';
import { GuildSettings, PermissionsNode } from '../lib/types/settings/GuildSettings';
import { SkyraGuild } from '../lib/extensions/SkyraGuild';
import { getFromPath } from '../lib/util/util';
import { AuditMeasurements, AuditSettingsTarget } from '../lib/types/influxSchema/Audit';
import { User, Client } from 'discord.js';

export default class extends Event {

	public async run(settings: Settings, changes: Record<string, unknown>) {
		switch (settings.gateway.name) {
			case 'clientStorage': {
				await this.updateAuditLog(undefined, undefined, this.client)
				break;
			}
			case 'users': {
				const user = settings.target as User;
				await this.updateAuditLog(undefined, user);
				break;
			}
			case 'guilds': {
				const guild = settings.target as SkyraGuild;
				this.updateFilter(guild, changes);
				await this.updatePermissionNodes(guild, changes);
				await this.updateAuditLog(guild);
				break;
			}
			default:
				break;
		}
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

	private updateAuditLog(guild?: SkyraGuild, user?: User, client?: Client) {
		let tags = {};
		if (guild) tags = { target: AuditSettingsTarget.Guild, guild_id: guild.id };
		if (user) tags = { target: AuditSettingsTarget.User, user_id: user.id };
		if (client) tags = { target: AuditSettingsTarget.Client, client_id: client.user?.id };
		// TODO(Quantum): Add data once SG provides it
		return this.client.influx.writePoints([
			{
				measurement: AuditMeasurements.SettingsUpdate,
				tags: { ...tags, shard: (this.client.options.shards as number[])[0].toString() }
			}
		]);
	}

}
