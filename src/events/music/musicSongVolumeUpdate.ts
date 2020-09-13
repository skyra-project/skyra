import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { floatPromise, pickRandom } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, previous: number, next: number, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			const { language } = channel.guild;
			const response =
				next > 200
					? language.get('commandVolumeChangedExtreme', {
							emoji: '📢',
							text: pickRandom(language.get('commandVolumeChangedTexts')),
							volume: next
					  })
					: language.get('commandVolumeChanged', {
							emoji: next > previous ? (next === 200 ? '📢' : '🔊') : next === 0 ? '🔇' : '🔉',
							volume: next
					  });
			floatPromise(this, channel.sendMessage(response));
		}

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicSongVolumeUpdate, data: { volume: next } });
		}
	}
}
