import type { Handler } from '#lib/i18n/structures/Handler';
import { ExtendedHandler as DeDeHandler } from '#root/languages/de-DE/constants';
import { ExtendedHandler as EnGbHandler } from '#root/languages/en-GB/constants';
import { ExtendedHandler as EnUsHandler } from '#root/languages/en-US/constants';
import { ExtendedHandler as EsEsHandler } from '#root/languages/es-ES/constants';
import { ExtendedHandler as NbNoHandler } from '#root/languages/nb-NO/constants';
import { ExtendedHandler as NlNlHandler } from '#root/languages/nl-NL/constants';

export const handlers = new Map<string, Handler>([
	['de-DE', new DeDeHandler()],
	['en-US', new EnUsHandler()],
	['en-GB', new EnGbHandler()],
	['es-ES', new EsEsHandler()],
	['nb-NO', new NbNoHandler()],
	['nl-NL', new NlNlHandler()]
]);

export function getHandler(name: string): Handler {
	return handlers.get(name) ?? handlers.get('en-US')!;
}
