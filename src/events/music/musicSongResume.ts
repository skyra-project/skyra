import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { floatPromise } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, context: MusicHandlerRequestContext | null) {
		if (manager.systemPaused) {
			manager.systemPaused = false;
		} else {
			const channel = context ? context.channel : manager.channel;

			if (channel) {
				floatPromise(this, channel.sendLocale('commandResumeSuccess'));
			}
		}

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicSongResume });
		}
	}
}
