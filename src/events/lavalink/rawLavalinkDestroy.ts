import { Events } from '@lib/types/Enums';
import { LavalinkDestroyEvent } from '@utils/LavalinkUtils';
import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			emitter: store.client.lavalink!,
			event: 'destroy'
		});
	}

	public run(payload: LavalinkDestroyEvent) {
		const manager = this.client.guilds.get(payload.guildId)?.music || null;
		return this.client.emit(Events.LavalinkDestroy, manager, payload);
	}

}
