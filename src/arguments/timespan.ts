import { isNumber } from '@sapphire/utilities';
import { Argument, Duration, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public run(arg: string, possible: Possible, message: KlasaMessage) {
		const duration = new Duration(arg);

		if (duration.offset <= 0 || !isNumber(duration.fromNow.getTime())) {
			throw message.language.get('resolverInvalidDuration', { name: possible.name });
		}

		const { min, max } = possible;

		// @ts-expect-error 2341
		return Argument.minOrMax(this.client, duration.offset, min, max, possible, message, '') ? duration.offset : null;
	}
}
