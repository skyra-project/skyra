import { Settings, EventStore, KeyedObject, SettingsUpdateContext } from 'klasa';
import { SkyraGuild } from '../lib/extensions/SkyraGuild';
import { AuditMeasurements, AuditSettingsTarget, AuditTags } from '../lib/types/influxSchema/Audit';
import { User, Client } from 'discord.js';
import AuditEvent from '../lib/structures/AuditEvent';
import { Events } from '../lib/types/Enums';
import { IPoint } from 'influx';

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
		// TODO(kyranet): Fill in proper type
		const tags: [string, string][] = [ [AuditTags.By, (context.extraContext as any)?.author ? `USER.${(context.extraContext as any).author}` : `CLIENT.${this.client.user!.id}`] ];
		const toWrite: IPoint[] = [];
		if (guild) tags.push(['target', AuditSettingsTarget.Guild], ['guild_id', guild.id])
		if (user) tags.push(['target', AuditSettingsTarget.User], ['user_id', user.id])
		if (client) tags.push(['target', AuditSettingsTarget.Client], ['client_id', client.user!.id])
		for (const entry of context.changes) {
			toWrite.push({
				fields: {
					key: entry.entry.path,
					value: JSON.stringify(entry.next)
				},
				tags: this.formTags(Object.fromEntries(tags))
			});
		}
		return this.writePoint(AuditMeasurements.SettingsUpdate, toWrite);
	}

}
