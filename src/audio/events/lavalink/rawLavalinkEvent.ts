import { AudioEvent } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventPayload } from '@skyra/audio';

@ApplyOptions<AudioEvent.Options>({ emitter: 'audio', event: 'event' })
export class UserAudioEvent extends AudioEvent {
	public run(payload: IncomingEventPayload) {
		this.context.client.emit(payload.type, payload);
	}
}
