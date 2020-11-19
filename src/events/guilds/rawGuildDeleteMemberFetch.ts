import { GatewayDispatchEvents, GatewayGuildDeleteDispatch } from 'discord-api-types/v6';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: GatewayDispatchEvents.GuildDelete, emitter: store.client.ws });
	}

	public run(data: GatewayGuildDeleteDispatch['d'], id: number) {
		this.client.guildMemberFetchQueue.remove(id, data.id);
	}
}
