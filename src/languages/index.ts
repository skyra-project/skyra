import { Handler } from '#lib/structures/i18n/Handler';
import { ExtendedHandler as EnUsHandler } from './en-US/constants';
import { ExtendedHandler as EnGbHandler } from './en-GB/constants';
import { ExtendedHandler as EsEsHandler } from './es-ES/constants';

export const handlers = new Map<string, Handler>([
	['en-US', new EnUsHandler()],
	['en-GB', new EnGbHandler()],
	['es-ES', new EsEsHandler()]
]);

export function getHandler(name: string): Handler {
	const handler = handlers.get(name);
	if (handler === undefined) throw new Error(`There is no available handler for ${name}.`);
	return handler;
}
