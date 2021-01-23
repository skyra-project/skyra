import { ENABLE_LAVALINK } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { GatewayDispatchEvents, GatewayVoiceState } from 'discord-api-types/v6';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.VoiceStateUpdate, emitter: 'ws' })
export default class extends Event {
	public async run(data: GatewayVoiceState): Promise<void> {
		try {
			await this.context.client.audio.voiceStateUpdate(data);
		} catch (error) {
			this.context.client.logger.error(error);
		}
	}

	public async onLoad() {
		if (!ENABLE_LAVALINK) await this.unload();
	}
}
