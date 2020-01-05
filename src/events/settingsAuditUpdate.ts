import { SkyraGuild } from '@lib/extensions/SkyraGuild';
import AuditEvent from '@lib/structures/analytics/AuditEvent';
import { Events } from '@lib/types/Enums';
import { Tags } from '@lib/types/influxSchema/tags';
import { AuditMeasurements, AuditSettingsTarget, AuditTags } from '@lib/types/influxSchema/Audit';
import { Client, User } from 'discord.js';
import { EventStore, Settings } from 'klasa';

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
		if (guild) tags = { [AuditTags.Target]: AuditSettingsTarget.Guild, [Tags.Guild]: guild.id };
		if (user) tags = { [AuditTags.Target]: AuditSettingsTarget.User, [Tags.User]: user.id };
		if (client) tags = { [AuditTags.Target]: AuditSettingsTarget.Client, [Tags.Client]: client.user?.id };
		// TODO(Quantum): Add data once SG provides it
		return this.writeMeasurement(AuditMeasurements.Announcement,
			{
				tags: this.formTags(tags)
			});
	}

}
