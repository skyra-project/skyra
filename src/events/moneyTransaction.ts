import EconomyEvent from '../lib/structures/analytics/EconomyEvent';
import { EventStore, KlasaUser } from 'klasa';
import { Events } from '../lib/types/Enums';
import { EconomyTransactionAction, EconomyMeasurements, EconomyTags } from '../lib/types/influxSchema/Economy';
import { Tags } from '../lib/types/influxSchema/tags';

export default class extends EconomyEvent {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			event: Events.MoneyTransaction
		});
	}

	public run(target: KlasaUser, moneyChange: number, moneyBeforeChange: number, action: EconomyTransactionAction): Promise<void> {
		const balance = EconomyTransactionAction.Add ? moneyBeforeChange + moneyChange : moneyBeforeChange - moneyChange;
		return this.writeMeasurement(EconomyMeasurements.Transaction, {
			fields: {
				change: moneyChange,
				balance,
				old_balance: moneyBeforeChange
			},
			tags: {
				[Tags.User]: target.id,
				[EconomyTags.Action]: action
			}
		});
	}

}
