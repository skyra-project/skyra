import { Event, EventStore } from 'klasa';
import { Events } from '../lib/types/Enums';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			emitter: store.client.lavalink!,
			event: 'event'
		});
	}

	public run(payload: any) {
		if (!payload.guildId) return;
		try {
			const guild = this.client.guilds.get(payload.guildId);
			if (guild) guild.music.receiver(payload);
		} catch (error) {
			this.client.emit(Events.Wtf, error);
		}
	}

}
