import { DiscordEvents } from '@lib/types/Events';
import { GatewayGuildCreateDispatch } from 'discord-api-types/v6';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.GuildCreate, emitter: store.client.ws });
	}

	public async run(data: GatewayGuildCreateDispatch['d']) {
		await Promise.all(data.voice_states!.map((state) => this.client.lavalink.voiceStateUpdate({ ...state, guild_id: data.id } as any)));
	}
}
