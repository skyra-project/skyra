import type { Handler } from '#lib/i18n/structures/Handler';
import { ExtendedHandler as DeDeHandler } from './de-DE/constants';
import { ExtendedHandler as EnGbHandler } from './en-GB/constants';
import { ExtendedHandler as EnUsHandler } from './en-US/constants';
import { ExtendedHandler as EsEsHandler } from './es-ES/constants';
import { ExtendedHandler as NbNoHandler } from './nb-NO/constants';
import { ExtendedHandler as NlNlHandler } from './nl-NL/constants';

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
