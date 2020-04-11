import { Events } from '@lib/types/Enums';
import { LavalinkPlayerUpdateEvent } from '@utils/LavalinkUtils';
import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			emitter: store.client.lavalink!,
			event: 'playerUpdate'
		});
	}

	public run(payload: LavalinkPlayerUpdateEvent) {
		const manager = this.client.guilds.get(payload.guildId)?.music || null;
		return this.client.emit(Events.LavalinkPlayerUpdate, manager, payload);
	}

}
