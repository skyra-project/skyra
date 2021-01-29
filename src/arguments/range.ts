import { LanguageKeys } from '#lib/i18n/languageKeys';
import { parseRange } from '#utils/util';
import { Argument, ArgumentContext } from '@sapphire/framework';

export class UserArgument extends Argument<number[]> {
	public run(argument: string, { maximum }: ArgumentContext) {
		const number = Number(argument);
		if (Number.isSafeInteger(number)) return this.ok([number]);

		const range = parseRange(argument);
		if (range.length === 0) return this.error(argument, LanguageKeys.Arguments.RangeInvalid);
		if (typeof maximum === 'number' && range.length > maximum) {
			return this.error(LanguageKeys.Arguments.RangeMax, { name: argument, maximum, count: maximum });
		}

		return this.ok(range);
	}
}
