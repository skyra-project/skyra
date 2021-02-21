import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext } from '@sapphire/framework';
import { Duration, Time } from '@sapphire/time-utilities';

export class UserArgument extends Argument<number> {
	public run(parameter: string, context: ArgumentContext) {
		const seconds = Number(parameter);
		const duration = Number.isNaN(seconds) ? new Duration(parameter).offset : seconds * Time.Second;

		if (duration < 0 || !Number.isSafeInteger(duration)) {
			return this.error({ parameter, identifier: LanguageKeys.Arguments.TimeSpan, context });
		}

		if (typeof context.minimum === 'number' && duration < context.minimum) {
			return this.error({ parameter, identifier: LanguageKeys.Arguments.TimeSpanTooSmall, context });
		}

		if (typeof context.maximum === 'number' && duration > context.maximum) {
			return this.error({ parameter, identifier: LanguageKeys.Arguments.TimeSpanTooBig, context });
		}

		return this.ok(duration);
	}
}
