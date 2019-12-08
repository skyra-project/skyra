import { IWriteOptions } from 'influx';
import { Databases } from '../../types/influxSchema/database';
import BaseAnalyticsEvent from './BaseAnalyticsEvent';
import { mergeDefault } from '@klasa/utils';
import { EventOptions, EventStore } from 'klasa';
import { Events } from '../../types/Enums';

export type PossibleEvents =
	Events.SettingsUpdate |
	Events.GuildAnnouncementEdit |
	Events.GuildAnnouncementSend |
	Events.GuildAnnouncementError;

export interface AuditEventOptions extends EventOptions {
	event: PossibleEvents;
}

export default abstract class AuditEvent extends BaseAnalyticsEvent {

	public event!: PossibleEvents;

	public constructor(store: EventStore, file: string[], directory: string, options?: AuditEventOptions) {
		super(store, file, directory, options);
	}

	protected getDefaultOptions(): IWriteOptions {
		return mergeDefault(super.getDefaultOptions(), {
			database: Databases.Audits
		});
	}

}
