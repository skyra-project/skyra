import { APIUserData } from '../lib/types/DiscordAPI';
import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'USER_UPDATE', emitter: store.client.ws });
	}

	public run(data: APIUserData) {
		const user = this.client.users.get(data.id);
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2339
		if (user) user._patch(data);
	}

}
