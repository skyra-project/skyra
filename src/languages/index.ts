import type { Handler } from '#lib/i18n/structures/Handler';
import { ExtendedHandler as DeHandler } from '#root/languages/de/constants';
import { ExtendedHandler as EnGbHandler } from '#root/languages/en-GB/constants';
import { ExtendedHandler as EnUsHandler } from '#root/languages/en-US/constants';
import { ExtendedHandler as EsEsHandler } from '#root/languages/es-ES/constants';
import { ExtendedHandler as NlHandler } from '#root/languages/nl/constants';
import { Locale } from 'discord.js';

export const handlers = new Map<Locale, Handler>([
	[Locale.German, new DeHandler()],
	[Locale.EnglishUS, new EnUsHandler()],
	[Locale.EnglishGB, new EnGbHandler()],
	[Locale.SpanishES, new EsEsHandler()],
	[Locale.Dutch, new NlHandler()]
]);

export function getHandler(name: Locale): Handler {
	return handlers.get(name) ?? handlers.get(Locale.EnglishUS)!;
}
