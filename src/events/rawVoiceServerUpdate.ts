import { Events } from '#lib/types/Enums';
import { ENABLE_LAVALINK } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import type { VoiceServerUpdate } from '@skyra/audio';
import { GatewayDispatchEvents } from 'discord-api-types/v6';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.VoiceServerUpdate, emitter: 'ws' })
export default class extends Event {
	public async run(data: VoiceServerUpdate): Promise<void> {
		try {
			await this.context.client.audio.voiceServerUpdate(data);
		} catch (error) {
			this.context.client.emit(Events.Error, error);
		}
	}

	public async onLoad() {
		if (!ENABLE_LAVALINK) await this.unload();
	}
}
