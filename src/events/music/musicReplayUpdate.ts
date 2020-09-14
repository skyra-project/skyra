import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { floatPromise } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, repeating: boolean, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendLocale(repeating ? 'commandRepeatSuccessEnabled' : 'commandRepeatSuccessDisabled'));
		}

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicReplayUpdate, data: { replay: repeating } });
		}
	}
}
