import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { floatPromise } from '@util/util';
import { OutgoingWebsocketAction } from '@lib/websocket/types';

export default class extends Event {

	public run(manager: MusicHandler, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_CLEAR_SUCCESS', [manager.queue.length]));
		}

		manager.queue.length = 0;

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicPrune });
		}
	}

}
