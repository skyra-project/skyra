import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { Song } from '@lib/structures/music/Song';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { floatPromise } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, song: Song, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_SKIP_SUCCESS', [song.safeTitle]));
		}

		manager.reset();

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicSongSkip, data: { queue: manager.queue.map((s) => s.toJSON()) } });
		}
	}
}
