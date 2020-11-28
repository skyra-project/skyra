import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isNumber } from '@sapphire/utilities';
import { Duration } from '@sapphire/time-utilities';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage) {
		const duration = new Duration(arg);

		if (duration.offset <= 0 || !isNumber(duration.fromNow.getTime())) {
			throw await message.fetchLocale(LanguageKeys.Resolvers.InvalidDuration, { name: possible.name });
		}

		const { min, max } = possible;

		// @ts-expect-error 2341
		return Argument.minOrMax(this.client, duration.offset, min, max, possible, message, '') ? duration.offset : null;
	}
}
