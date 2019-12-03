import { Settings, EventStore } from 'klasa';
import { SkyraGuild } from '../lib/extensions/SkyraGuild';
import { AuditMeasurements, AuditSettingsTarget } from '../lib/types/influxSchema/Audit';
import { User, Client } from 'discord.js';
import AuditEvent from '../lib/structures/AuditEvent';
import { Events } from '../lib/types/Enums';

export default class extends AuditEvent {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			event: Events.SettingsUpdate,
			// TODO(Quantum): Enable on full release
			enabled: false
		});
	}

	public async run(settings: Settings) {
		switch (settings.gateway.name) {
			case 'clientStorage': {
				await this.updateAuditLog(undefined, undefined, this.client);
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
		return this.writePoint(AuditMeasurements.Announcement, [
			{
				tags: this.formTags(tags)
			}
		]);
	}

}
