import { EventOptions, EventStore } from 'klasa';
import { Events } from '@lib/types/Enums';
import { Databases } from '@lib/types/influxSchema/database';
import BaseAnalyticsEvent from './BaseAnalyticsEvent';

export type PossibleEvents =
	Events.SettingsUpdate
	| Events.GuildAnnouncementEdit
	| Events.GuildAnnouncementSend
	| Events.GuildAnnouncementError;

export interface AuditEventOptions extends EventOptions {
	event: PossibleEvents;
}

export default abstract class AuditEvent extends BaseAnalyticsEvent {

	public event!: PossibleEvents;

	public DATABASE = Databases.Audits;

	public constructor(store: EventStore, file: string[], directory: string, options?: AuditEventOptions) {
		super(store, file, directory, options);
	}

}
