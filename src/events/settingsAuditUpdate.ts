import { Event, Settings, EventStore } from 'klasa';
import { SkyraGuild } from '../lib/extensions/SkyraGuild';
import { AuditMeasurements, AuditSettingsTarget } from '../lib/types/influxSchema/Audit';
import { User, Client } from 'discord.js';
import { ENABLE_INFLUX } from '../../config';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { event: 'settingsUpdate' });
	}

	public async init() {
		if (!ENABLE_INFLUX) this.disable();
	}

	public async run(settings: Settings) {
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
				await this.updateAuditLog(guild);
				break;
			}
			default:
				break;
		}
	}

	private updateAuditLog(guild?: SkyraGuild, user?: User, client?: Client) {
		let tags = {};
		if (guild) tags = { target: AuditSettingsTarget.Guild, guild_id: guild.id };
		if (user) tags = { target: AuditSettingsTarget.User, user_id: user.id };
		if (client) tags = { target: AuditSettingsTarget.Client, client_id: client.user?.id };
		// TODO(Quantum): Add data once SG provides it
		return this.client.influx!.writePoints([
			{
				measurement: AuditMeasurements.SettingsUpdate,
				tags: { ...tags, shard: (this.client.options.shards as number[])[0].toString() }
			}
		]);
	}

}
