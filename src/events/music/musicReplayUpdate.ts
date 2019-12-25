import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public run(manager: MusicHandler, repeating: boolean) {
		const { channel } = manager;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_REPEAT_SUCCESS', [repeating]));
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
