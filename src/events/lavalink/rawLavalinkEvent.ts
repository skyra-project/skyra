import type { IncomingEventPayload } from '@skyra/audio';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ emitter: 'audio', event: 'event' })
export default class extends Event {
	public run(payload: IncomingEventPayload) {
		this.client.emit(payload.type, payload);
	}
}
