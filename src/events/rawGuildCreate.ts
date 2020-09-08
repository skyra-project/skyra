import { WSGuildCreate } from '@lib/types/DiscordAPI';
import { DiscordEvents } from '@lib/types/Events';
import { Event, EventStore } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.GuildCreate, emitter: store.client.ws });
	}

	public async run(data: WSGuildCreate) {
		await Promise.all(data.voice_states.map((state) => this.client.lavalink.voiceStateUpdate({ ...state, guild_id: data.id })));
	}
}
