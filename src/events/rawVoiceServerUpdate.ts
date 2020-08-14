import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { ENABLE_LAVALINK } from '@root/config';
import { Event, EventStore } from 'klasa';
import { VoiceServerUpdate } from 'lavacord';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.VoiceServerUpdate, emitter: store.client.ws });
	}

	public async run(data: VoiceServerUpdate): Promise<void> {
		try {
			await this.client.lavalink.voiceServerUpdate(data);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

	public init() {
		if (!ENABLE_LAVALINK) this.disable();
		return Promise.resolve();
	}
}
