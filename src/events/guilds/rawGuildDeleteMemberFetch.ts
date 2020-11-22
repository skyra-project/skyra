import { GatewayDispatchEvents, GatewayGuildDeleteDispatch } from 'discord-api-types/v6';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { event: GatewayDispatchEvents.GuildDelete, emitter: store.client.ws });
	}

	public run(data: GatewayGuildDeleteDispatch['d'], shardID: number) {
		this.client.guildMemberFetchQueue.remove(shardID, data.id);
	}
}
