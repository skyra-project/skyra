import { ApplyOptions } from '@sapphire/decorators';
import { HttpCodes, MiddlewareErrorContext, ServerEvents } from '@sapphire/plugin-api';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'server', event: ServerEvents.RouteError })
export class PluginEvent extends Event {
	public run(error: Error, { response }: MiddlewareErrorContext) {
		// Log the error to console:
		this.context.client.console.wtf(error);

		// Send a response to the client if none was sent:
		if (!response.writableEnded) response.status(HttpCodes.InternalServerError).json({ error: error.message ?? error });
	}
}
