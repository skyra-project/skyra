import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, RouteMatch, ServerEvents } from '@sapphire/plugin-api';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'server', event: ServerEvents.MiddlewareSuccess })
export class PluginEvent extends Event {
	public async run(request: ApiRequest, response: ApiResponse, match: RouteMatch) {
		try {
			await match.cb(request, response);
		} catch (error) {
			this.context.server.emit(ServerEvents.RouteError, error, { request, response, match });
		}
	}
}
