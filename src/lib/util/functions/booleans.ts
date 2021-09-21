import { LanguageKeys } from '#lib/i18n/languageKeys';
import { resolveT, TResolvable } from '#lib/i18n/translate';

export function formatBoolean(t: TResolvable, value: boolean): string {
	const tFunction = resolveT(t);
	return tFunction(value ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No);
}
