import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { floatPromise } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(
				this,
				channel.sendLocale(
					manager.queue.length === 1 ? LanguageKeys.Commands.Music.ClearSuccess : LanguageKeys.Commands.Music.ClearSuccessPlural,
					[{ count: manager.queue.length }]
				)
			);
		}

		manager.queue.length = 0;

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicPrune });
		}
	}
}
