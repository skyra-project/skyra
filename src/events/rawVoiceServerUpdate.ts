import { Events } from '@lib/types/Enums';
import { ENABLE_LAVALINK } from '@root/config';
import { VoiceServerUpdate } from '@skyra/audio';
import { GatewayDispatchEvents } from 'discord-api-types/v6';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { event: GatewayDispatchEvents.VoiceServerUpdate, emitter: store.client.ws });
	}

	public async run(data: VoiceServerUpdate): Promise<void> {
		try {
			await this.client.audio.voiceServerUpdate(data);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

	public init() {
		if (!ENABLE_LAVALINK) this.disable();
		return Promise.resolve();
	}
}
