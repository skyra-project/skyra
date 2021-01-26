import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext, Identifiers } from '@sapphire/framework';
import { Duration } from '@sapphire/time-utilities';
import { isNumber } from '@sapphire/utilities';

export class UserArgument extends Argument<number> {
	public run(parameter: string, context: ArgumentContext) {
		const duration = new Duration(parameter);

		if (duration.offset <= 0 || !isNumber(duration.fromNow.getTime())) {
			return this.error({ parameter, identifier: LanguageKeys.Arguments.Duration, context });
		}

		if (!Number.isInteger(duration.offset)) {
			return this.error({ parameter, identifier: Identifiers.ArgumentInteger, context });
		}

		if (typeof context.minimum === 'number' && duration.offset < context.minimum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentIntegerTooSmall, context });
		}

		if (typeof context.maximum === 'number' && duration.offset > context.maximum) {
			return this.error({ parameter, identifier: Identifiers.ArgumentIntegerTooBig, context });
		}

		return this.ok(duration.offset);
	}
}
