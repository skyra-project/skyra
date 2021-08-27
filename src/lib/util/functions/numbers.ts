import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
import type { TFunction } from '@sapphire/plugin-i18next';

type TResolvable = SkyraArgs | TFunction;

function resolveT(t: TResolvable): TFunction {
	return typeof t === 'function' ? t : t.t;
}

export function formatNumber(t: TResolvable, value: number): string {
	return resolveT(t)(LanguageKeys.Globals.NumberValue, { value });
}
