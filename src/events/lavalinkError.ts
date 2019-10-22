import { Event, EventStore } from 'klasa';
import { Events } from '../lib/types/Enums';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			emitter: store.client.lavalink!,
			event: 'error'
		});
	}

	public run(error: Error) {
		this.client.emit(Events.Error, error);
	}

}
