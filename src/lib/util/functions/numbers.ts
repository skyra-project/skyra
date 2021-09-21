import { LanguageKeys } from '#lib/i18n/languageKeys';
import { resolveT, TResolvable } from '#lib/i18n/translate';

export function formatNumber(t: TResolvable, value: number): string {
	return resolveT(t)(LanguageKeys.Globals.NumberValue, { value });
}
