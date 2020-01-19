import { Settings, EventStore, KeyedObject, SettingsUpdateContext } from 'klasa';
import { SkyraGuild } from '@lib/extensions/SkyraGuild';
import { AuditMeasurements, AuditSettingsTarget, AuditTags } from '@lib/types/influxSchema/Audit';
import { User, Client } from 'discord.js';
import AuditEvent from '@lib/structures/anogs/AuditEvent';
import { Events } from '@lib/types/Enums';
import { IPoint } from 'influx';
import { Tags } from '@lib/types/influxSchema/tags';
import { SettingsAuditContext } from '../../lib/types/settings/Shared';

export default class extends AuditEvent {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			event: Events.SettingsUpdate
		});
	}

	public async run(settings: Settings, _: KeyedObject, context: SettingsUpdateContext) {
		switch (settings.gateway.name) {
			case 'clientStorage': {
				await this.updateAuditLog(context, undefined, undefined, this.client);
				break;
			}
			case 'users': {
				const user = settings.target as User;
				await this.updateAuditLog(context, undefined, user);
				break;
			}
			case 'guilds': {
				const guild = settings.target as SkyraGuild;
				await this.updateAuditLog(context, guild);
				break;
			}
			default:
				break;
		}
	}

	private updateAuditLog(context: SettingsUpdateContext, guild?: SkyraGuild, user?: User, client?: Client) {
		const extraContext: SettingsAuditContext = context.extraContext as SettingsAuditContext;
		if (extraContext.auditIgnore) return;
		const tags: [string, string][] = [[AuditTags.By, extraContext.author ? `USER.${extraContext.author}` : `CLIENT.${this.client.user!.id}`]];
		const toWrite: IPoint[] = [];
		if (guild) tags.push(['target', AuditSettingsTarget.Guild], [Tags.Guild, guild.id]);
		if (user) tags.push(['target', AuditSettingsTarget.User], [Tags.User, user.id]);
		if (client) tags.push(['target', AuditSettingsTarget.Client], [Tags.Client, client.user!.id]);
		for (const entry of context.changes) {
			toWrite.push({
				fields: {
					key: entry.entry.path,
					value: JSON.stringify(entry.next)
				},
				tags: this.formTags(Object.fromEntries(tags))
			});
		}
		return this.writeMeasurements(AuditMeasurements.SettingsUpdate, toWrite);
	}

}
