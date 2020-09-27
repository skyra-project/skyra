import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { parseRange } from '@utils/util';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public run(arg: string, possible: Possible, message: KlasaMessage) {
		if (!arg) throw message.language.get(LanguageKeys.Arguments.RangeInvalid, { name: possible.name });

		const number = Number(arg);
		if (Number.isSafeInteger(number)) return [number];

		const range = parseRange(arg);
		if (range.length === 0) throw message.language.get(LanguageKeys.Arguments.RangeInvalid, { name: possible.name });
		if (typeof possible.max === 'number' && range.length > possible.max)
			throw message.language.get(possible.max === 1 ? LanguageKeys.Arguments.RangeMax : LanguageKeys.Arguments.RangeMaxPlural, {
				name: possible.name,
				maximum: possible.max,
				count: possible.max
			});
		return range;
	}
}
