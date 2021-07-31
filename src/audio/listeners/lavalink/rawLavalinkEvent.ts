import { AudioListener } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventPayload } from '@skyra/audio';

@ApplyOptions<AudioListener.Options>({ emitter: 'audio', event: 'event' })
export class UserAudioListener extends AudioListener {
	public run(payload: IncomingEventPayload) {
		this.container.client.emit(payload.type, payload);
	}
}
