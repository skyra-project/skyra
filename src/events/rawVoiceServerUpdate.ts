import { VoiceServerUpdate } from 'lavalink';
import { Events } from '../lib/types/Enums';
import { EventStore, Event } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'VOICE_SERVER_UPDATE', emitter: store.client.ws });
	}

	public async run(data: VoiceServerUpdate): Promise<void> {
		try {
			await this.client.lavalink!.voiceServerUpdate(data);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

	public init() {
		if (!this.client.lavalink) this.disable();
		return Promise.resolve();
	}

}
