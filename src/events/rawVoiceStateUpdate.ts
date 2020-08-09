import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { ENABLE_LAVALINK } from '@root/config';
import { Event, EventStore } from 'klasa';
import { VoiceStateUpdate } from 'lavacord';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.VoiceStateUpdate, emitter: store.client.ws });
	}

	public async run(data: VoiceStateUpdate): Promise<void> {
		try {
			await this.client.lavalink.voiceStateUpdate(data);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

	public init() {
		if (!ENABLE_LAVALINK) this.disable();
		return Promise.resolve();
	}
}
