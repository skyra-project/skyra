import type { Handler } from '#lib/i18n/structures/Handler';
import { ExtendedHandler as DeHandler } from '#root/languages/de/constants';
import { ExtendedHandler as EnGbHandler } from '#root/languages/en-GB/constants';
import { ExtendedHandler as EnUsHandler } from '#root/languages/en-US/constants';
import { ExtendedHandler as EsEsHandler } from '#root/languages/es-ES/constants';
import { ExtendedHandler as NlHandler } from '#root/languages/nl/constants';
import type { LocaleString } from 'discord.js';

export const handlers = new Map<LocaleString, Handler>([
	['de', new DeHandler()],
	['en-US', new EnUsHandler()],
	['en-GB', new EnGbHandler()],
	['es-ES', new EsEsHandler()],
	['nl', new NlHandler()]
]);

export function getHandler(name: LocaleString): Handler {
	return handlers.get(name) ?? handlers.get('en-US')!;
}
