import { GatewayDispatchEvents, GatewayGuildDeleteDispatch } from 'discord-api-types/v6';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: GatewayDispatchEvents.GuildDelete, emitter: store.client.ws });
	}

	public run(data: GatewayGuildDeleteDispatch['d']) {
		this.client.settings.guilds.delete(data.id);
		this.client.audio.queues?.delete(data.id);
	}
}
