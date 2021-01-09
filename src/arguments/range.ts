import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { parseRange } from '#utils/util';
import { Argument, KlasaMessage, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage) {
		if (!arg) throw await message.resolveKey(LanguageKeys.Arguments.RangeInvalid, { name: possible.name });

		const number = Number(arg);
		if (Number.isSafeInteger(number)) return [number];

		const range = parseRange(arg);
		if (range.length === 0) throw await message.resolveKey(LanguageKeys.Arguments.RangeInvalid, { name: possible.name });
		if (typeof possible.max === 'number' && range.length > possible.max)
			throw await message.resolveKey(LanguageKeys.Arguments.RangeMax, {
				name: possible.name,
				maximum: possible.max,
				count: possible.max
			});
		return range;
	}
}
