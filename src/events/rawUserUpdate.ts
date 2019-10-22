import { Event, EventOptions } from 'klasa';
import { APIUserData } from '../lib/types/DiscordAPI';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<EventOptions>({
	name: 'USER_UPDATE',
	emitter: 'ws'
})
export default class extends Event {

	public run(data: APIUserData) {
		const user = this.client.users.get(data.id);
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2339
		if (user) user._patch(data);
	}

}
