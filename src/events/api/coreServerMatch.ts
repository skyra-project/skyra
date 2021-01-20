import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, RouteMatch, ServerEvents } from '@sapphire/plugin-api';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'server', event: ServerEvents.Match })
export class PluginEvent extends Event {
	public run(request: ApiRequest, response: ApiResponse, match: RouteMatch) {
		this.context.server.emit(response.writableEnded ? ServerEvents.MiddlewareFailure : ServerEvents.MiddlewareSuccess, request, response, match);
	}
}
