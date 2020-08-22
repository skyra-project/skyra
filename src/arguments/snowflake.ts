import { Snowflake } from '@klasa/snowflake';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	/**
	 * The validator, requiring all numbers and 17 to 19 digits (future-proof).
	 */
	private readonly kRegExp = /^\d{17,19}$/;

	/**
	 * Stanislav's join day, known as the oldest user in Discord, and practically
	 * the lowest snowflake we can get (as they're bound by the creation date).
	 */
	private readonly kMinimum = new Date(2015, 1, 28).getTime();

	public run(arg: string, possible: Possible, message: KlasaMessage) {
		if (!arg) throw message.language.get('argumentRangeInvalid', { name: possible.name });

		if (this.kRegExp.test(arg)) {
			const snowflake = new Snowflake(arg);
			if (snowflake.timestamp >= this.kMinimum && snowflake.timestamp < Date.now()) return arg;
		}
		throw message.language.get('resolverInvalidSnowflake', { name: possible.name });
	}
}
