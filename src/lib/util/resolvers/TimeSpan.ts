import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Parameter, TypedFT } from '#lib/types';
import { seconds } from '#utils/common';
import { Result, err, ok } from '@sapphire/framework';
import { Duration } from '@sapphire/time-utilities';

export function resolveTimeSpan(parameter: string, options?: TimeSpanOptions): Result<number, TypedFT<Parameter>> {
	const duration = parse(parameter);

	if (!Number.isSafeInteger(duration)) {
		return err(LanguageKeys.Arguments.TimeSpan);
	}

	if (typeof options?.minimum === 'number' && duration < options.minimum) {
		return err(LanguageKeys.Arguments.TimeSpanTooSmall);
	}

	if (typeof options?.maximum === 'number' && duration > options.maximum) {
		return err(LanguageKeys.Arguments.TimeSpanTooBig);
	}

	return ok(duration);
}

function parse(parameter: string) {
	const number = Number(parameter);
	if (!Number.isNaN(number)) return seconds(number);

	const duration = new Duration(parameter).offset;
	if (!Number.isNaN(duration)) return duration;

	const date = Date.parse(parameter);
	if (!Number.isNaN(date)) return date - Date.now();

	return NaN;
}

export interface TimeSpanOptions {
	minimum?: number;
	maximum?: number;
}
