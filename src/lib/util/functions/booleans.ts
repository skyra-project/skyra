import { LanguageKeys } from '#lib/i18n/languageKeys';
import { resolveT, TResolvable } from '#lib/i18n/translate';

export function formatBoolean(t: TResolvable, value: boolean): string {
	const tFunction = resolveT(t);

	if (value) return tFunction(LanguageKeys.Globals.Yes);
	return tFunction(LanguageKeys.Globals.No);
}
