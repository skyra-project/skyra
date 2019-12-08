import { IWriteOptions } from 'influx';
import { Databases } from '../../types/influxSchema/database';
import BaseAnalyticsEvent from './BaseAnalyticsEvent';
import { mergeDefault } from '@klasa/utils';
import { EventStore, EventOptions } from 'klasa';
import { Events } from '../../types/Enums';

export type PossibleEvents =
	Events.MoneyTransaction |
	Events.MoneyPayment;

export interface EconomyEventOptions extends EventOptions {
	event: PossibleEvents;
}

export default abstract class EconomyEvent extends BaseAnalyticsEvent {

	public event!: PossibleEvents;

	public constructor(store: EventStore, file: string[], directory: string, options?: EconomyEventOptions) {
		super(store, file, directory, options);
	}

	protected getDefaultOptions(): IWriteOptions {
		return mergeDefault(super.getDefaultOptions(), {
			database: Databases.Economy
		});
	}

}
