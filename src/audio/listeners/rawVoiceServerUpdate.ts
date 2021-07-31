import { AudioListener } from '#lib/audio';
import { ApplyOptions } from '@sapphire/decorators';
import type { VoiceServerUpdate } from '@skyra/audio';
import { GatewayDispatchEvents } from 'discord-api-types/v9';

@ApplyOptions<AudioListener.Options>({ event: GatewayDispatchEvents.VoiceServerUpdate, emitter: 'ws' })
export class UserAudioListener extends AudioListener {
	public async run(data: VoiceServerUpdate): Promise<void> {
		try {
			await this.container.client.audio!.voiceServerUpdate(data);
		} catch (error) {
			this.container.logger.error(error);
		}
	}
}
