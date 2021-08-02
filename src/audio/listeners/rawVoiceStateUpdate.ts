import { AudioListener } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import { GatewayDispatchEvents, GatewayVoiceState } from 'discord-api-types/v9';

@ApplyOptions<AudioListener.Options>({ event: GatewayDispatchEvents.VoiceStateUpdate, emitter: 'ws' })
export class UserAudioListener extends AudioListener {
	public async run(data: GatewayVoiceState): Promise<void> {
		try {
			await this.container.client.audio!.voiceStateUpdate(data);
		} catch (error) {
			this.container.logger.error(error);
		}
	}
}
