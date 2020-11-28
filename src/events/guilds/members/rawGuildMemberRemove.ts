import { Events } from '#lib/types/Enums';
import { GatewayDispatchEvents, GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v6';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { event: GatewayDispatchEvents.GuildMemberRemove, emitter: store.client.ws });
	}

	public run(data: GatewayGuildMemberRemoveDispatch['d']) {
		const guild = this.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.available) return;

		this.client.emit(Events.RawMemberRemove, guild, data);
	}
}
