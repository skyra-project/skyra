import { Events } from '@lib/types/Enums';
import { GatewayMessageDeleteBulkDispatch } from 'discord-api-types/v6';
import { Guild } from 'discord.js';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: Events.RawMessageDelete, emitter: store.client.ws });
	}

	public run(guild: Guild, data: GatewayMessageDeleteBulkDispatch['d']): void {
		if (!guild.channels.cache.has(data.channel_id)) return;

		this.client.emit(Events.RawMessageDeleteBulk, guild, data);
	}
}
