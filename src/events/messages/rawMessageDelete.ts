import { Events } from '#lib/types/Enums';
import { GatewayDispatchEvents, GatewayMessageDeleteDispatch } from 'discord-api-types/v6';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { event: GatewayDispatchEvents.MessageDelete, emitter: store.client.ws });
	}

	public run(data: GatewayMessageDeleteDispatch['d']): void {
		if (!data.guild_id) return;

		const guild = this.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.channels.cache.has(data.channel_id)) return;

		this.client.emit(Events.RawMessageDelete, guild, data);
	}
}
