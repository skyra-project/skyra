import { Databases } from '../../types/influxSchema/database';
import BaseAnalyticsEvent from './BaseAnalyticsEvent';
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

	public DATABASE = Databases.Economy;

	public constructor(store: EventStore, file: string[], directory: string, options?: EconomyEventOptions) {
		super(store, file, directory, options);
	}

}
