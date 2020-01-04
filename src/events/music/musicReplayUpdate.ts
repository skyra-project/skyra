import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { floatPromise } from '@util/util';
import { OutgoingWebsocketAction } from '@lib/websocket/types';

export default class extends Event {

	public run(manager: MusicHandler, repeating: boolean, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale('COMMAND_REPEAT_SUCCESS', [repeating]));
		}

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicReplayUpdate, data: { replay: repeating } });
		}
	}

}
