import { APIUserData } from '../lib/types/DiscordAPI';
import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'USER_UPDATE', emitter: store.client.ws });
	}

	public async run(data: APIUserData): Promise<void> {
		const user = this.client.users.get(data.id);
		// @ts-ignore
		if (user) user._patch(data);
	}

}
