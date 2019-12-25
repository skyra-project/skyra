import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public run(manager: MusicHandler) {
		const { channel } = manager;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_CLEAR_SUCCESS', [manager.queue.length]));
		}

		manager.queue.length = 0;

		// TODO (Favna | Magna): Add WS handler
	}

}
