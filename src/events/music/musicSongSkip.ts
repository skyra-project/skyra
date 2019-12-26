import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '../../lib/structures/music/MusicHandler';
import { Song } from '../../lib/structures/music/Song';
import { floatPromise } from '../../lib/util/util';
import { OutgoingWebsocketAction } from '../../lib/websocket/types';

export default class extends Event {

	public run(manager: MusicHandler, song: Song, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_SKIP_SUCCESS', [song.safeTitle]));
		}

		manager.reset();

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicSongSkip, data: { id: song.id } });
		}
	}

}
