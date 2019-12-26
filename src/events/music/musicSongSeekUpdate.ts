import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '../../lib/structures/music/MusicHandler';
import { floatPromise } from '../../lib/util/util';
import { OutgoingWebsocketAction } from '../../lib/websocket/types';

export default class extends Event {

	public run(manager: MusicHandler, position: number, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_SEEK_SUCCESS', [position]));
		}

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicSongSeekUpdate, data: position });
		}
	}

}
