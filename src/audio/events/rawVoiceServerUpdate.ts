import { AudioEvent } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import type { VoiceServerUpdate } from '@skyra/audio';
import { GatewayDispatchEvents } from 'discord-api-types/v6';

@ApplyOptions<AudioEvent.Options>({ event: GatewayDispatchEvents.VoiceServerUpdate, emitter: 'ws' })
export class UserAudioEvent extends AudioEvent {
	public async run(data: VoiceServerUpdate): Promise<void> {
		try {
			await this.context.client.audio.voiceServerUpdate(data);
		} catch (error) {
			this.context.client.logger.error(error);
		}
	}
}
