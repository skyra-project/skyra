import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, ServerEvents } from '@sapphire/plugin-api';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'server', event: ServerEvents.NoMatch })
export class PluginEvent extends Event {
	public run(_: ApiRequest, response: ApiResponse) {
		if (!response.writableEnded) response.notFound();
	}
}
