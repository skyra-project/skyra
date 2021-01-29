import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext } from '@sapphire/framework';
import { Duration } from '@sapphire/time-utilities';
import { isNumber } from '@sapphire/utilities';

export class UserArgument extends Argument<number> {
	public run(argument: string, context: ArgumentContext) {
		const duration = new Duration(argument);

		if (duration.offset <= 0 || !isNumber(duration.fromNow.getTime())) {
			return this.error(argument, LanguageKeys.Resolvers.InvalidDuration);
		}

		if (!Number.isInteger(duration.offset)) {
			return this.error(argument, 'ArgumentIntegerInvalidNumber', 'The argument did not resolve to an integer.');
		}

		if (typeof context.minimum === 'number' && duration.offset < context.minimum) {
			return this.error(argument, 'ArgumentIntegerTooSmall', `The argument must be greater than ${context.minimum}.`);
		}

		if (typeof context.maximum === 'number' && duration.offset > context.maximum) {
			return this.error(argument, 'ArgumentIntegerTooBig', `The argument must be less than ${context.maximum}.`);
		}

		return this.ok(duration.offset);
	}
}
