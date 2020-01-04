import { Events } from '@lib/types/Enums';
import { Event, EventStore } from 'klasa';
import { VoiceStateUpdate } from 'lavalink';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'VOICE_STATE_UPDATE', emitter: store.client.ws });
	}

	public async run(data: VoiceStateUpdate): Promise<void> {
		try {
			await this.client.lavalink!.voiceStateUpdate(data);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

	public init() {
		if (!this.client.lavalink) this.disable();
		return Promise.resolve();
	}

}
