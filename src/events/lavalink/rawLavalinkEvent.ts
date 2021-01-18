import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventPayload } from '@skyra/audio';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'audio', event: 'event' })
export default class extends Event {
	public run(payload: IncomingEventPayload) {
		this.context.client.emit(payload.type, payload);
	}
}
