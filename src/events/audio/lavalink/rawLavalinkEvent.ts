import { AudioEvent } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventPayload } from '@skyra/audio';

@ApplyOptions<AudioEvent.Options>({ emitter: 'audio', event: 'event' })
export default class extends AudioEvent {
	public run(payload: IncomingEventPayload) {
		this.context.client.emit(payload.type, payload);
	}
}
