import { LanguageKeys } from '#lib/i18n/languageKeys';
import { seconds } from '#utils/common';
import { Argument } from '@sapphire/framework';
import { Duration } from '@sapphire/time-utilities';

export class UserArgument extends Argument<number> {
	public run(parameter: string, context: Argument.Context) {
		const duration = this.parseParameter(parameter);

		if (!Number.isSafeInteger(duration)) {
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
		const number = Number(parameter);
		if (!Number.isNaN(number)) return seconds(number);

		const duration = new Duration(parameter).offset;
		if (!Number.isNaN(duration)) return duration;

		const date = Date.parse(parameter);
		if (!Number.isNaN(date)) return date - Date.now();

		return NaN;
	}
}
