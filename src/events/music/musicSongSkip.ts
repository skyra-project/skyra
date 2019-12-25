import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { Song } from '../../lib/structures/music/Song';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public run(manager: MusicHandler, song: Song) {
		const { channel } = manager;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_SKIP_SUCCESS', [song.safeTitle]));
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
