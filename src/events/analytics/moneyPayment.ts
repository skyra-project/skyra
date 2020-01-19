import { EventStore, KlasaMessage, KlasaUser } from 'klasa';
import EconomyEvent from '@lib/structures/anogs/EconomyEvent';
import { Events } from '@lib/types/Enums';
import { EconomyMeasurements, EconomyTags } from '@lib/types/influxSchema/Economy';
import { Tags } from '@lib/types/influxSchema/tags';

export default class extends EconomyEvent {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			event: Events.MoneyPayment
		});
	}

	public run(message: KlasaMessage, user: KlasaUser, target: KlasaUser, money: number): Promise<void> {
		return this.writeMeasurement(EconomyMeasurements.Payment, {
			fields: {
				amount: money
			},
			tags: this.formTags({
				[Tags.Message]: message.id,
				[Tags.User]: user.id,
				[EconomyTags.Target]: target.id
			})
		});
	}

}
