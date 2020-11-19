import { GatewayDispatchEvents, GatewayGuildCreateDispatch } from 'discord-api-types/v6';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: GatewayDispatchEvents.GuildCreate, emitter: store.client.ws });
	}

	public run(data: GatewayGuildCreateDispatch['d'], id: number) {
		this.client.guildMemberFetchQueue.add(id, data.id);
	}
}
