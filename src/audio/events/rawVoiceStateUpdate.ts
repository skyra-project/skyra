import { AudioEvent } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import { GatewayDispatchEvents, GatewayVoiceState } from 'discord-api-types/v6';

@ApplyOptions<AudioEvent.Options>({ event: GatewayDispatchEvents.VoiceStateUpdate, emitter: 'ws' })
export class UserAudioEvent extends AudioEvent {
	public async run(data: GatewayVoiceState): Promise<void> {
		try {
			await this.context.client.audio.voiceStateUpdate(data);
		} catch (error) {
			this.context.client.logger.error(error);
		}
	}
}
