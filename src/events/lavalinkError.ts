import { Event, EventStore, KlasaClient } from 'klasa';
import { Events } from '../lib/types/Enums';

export default class extends Event {

	public constructor(client: KlasaClient, store: EventStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			emitter: client.lavalink,
			event: 'error'
		});
	}

	public run(error: Error) {
		this.client.emit(Events.Error, error);
	}

}
