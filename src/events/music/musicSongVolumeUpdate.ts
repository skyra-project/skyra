import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
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
					? language.get(LanguageKeys.Commands.Music.VolumeChangedExtreme, {
							emoji: '📢',
							text: pickRandom(language.get(LanguageKeys.Commands.Music.VolumeChangedTexts)),
							volume: next
					  })
					: language.get(LanguageKeys.Commands.Music.VolumeChanged, {
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
