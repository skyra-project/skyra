import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '../../lib/structures/music/MusicHandler';
import { floatPromise } from '../../lib/util/util';
import { Song } from '../../lib/structures/music/Song';

export default class extends Event {

	public run(manager: MusicHandler, song: Song, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_REMOVE_SUCCESS', [song]));
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
