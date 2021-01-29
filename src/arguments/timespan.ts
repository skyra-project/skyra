import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext } from '@sapphire/framework';
import { Duration } from '@sapphire/time-utilities';
import { isNumber } from '@sapphire/utilities';

export class UserArgument extends Argument<number> {
	public run(parameter: string, context: ArgumentContext) {
		const duration = new Duration(parameter);

		if (duration.offset <= 0 || !isNumber(duration.fromNow.getTime())) {
			return this.error({ parameter, identifier: LanguageKeys.Resolvers.InvalidDuration });
		}

		if (!Number.isInteger(duration.offset)) {
			return this.error({ parameter, identifier: 'ArgumentIntegerInvalidNumber', context });
		}

		if (typeof context.minimum === 'number' && duration.offset < context.minimum) {
			return this.error({ parameter, identifier: 'ArgumentIntegerTooSmall', context });
		}

		if (typeof context.maximum === 'number' && duration.offset > context.maximum) {
			return this.error({ parameter, identifier: 'ArgumentIntegerTooBig', context });
		}

		return this.ok(duration.offset);
	}
}
