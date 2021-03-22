import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument, ArgumentContext } from '@sapphire/framework';
import { Duration, Time } from '@sapphire/time-utilities';

export class UserArgument extends Argument<number> {
	public run(parameter: string, context: ArgumentContext) {
		const duration = this.parseParameter(parameter);

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

	private parseParameter(parameter: string): number {
		const seconds = Number(parameter);
		if (!Number.isNaN(seconds)) return seconds * Time.Second;

		const duration = new Duration(parameter).offset;
		if (!Number.isNaN(duration)) return duration;

		const date = Date.parse(parameter);
		if (!Number.isNaN(date)) return date - Date.now();

		return NaN;
	}
}
