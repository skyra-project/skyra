import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { floatPromise } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public async run(manager: MusicHandler, song: MusicHandler['song'], context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		manager.position = 0;
		manager.lastUpdate = 0;
		manager.song = song;
		manager.systemPaused = false;

		if (song) {
			if (channel) {
				const name = await song.fetchRequesterName();
				floatPromise(
					this,
					channel.sendLocale(LanguageKeys.Commands.Music.PlayNext, [{ title: song.safeTitle, requester: name }], {
						allowedMentions: { users: [], roles: [] }
					})
				);
			}

			for (const subscription of manager.websocketUserIterator()) {
				subscription.send({
					action: OutgoingWebsocketAction.MusicSongPlay,
					data: {
						song: song.toJSON(),
						queue: manager.queue.map((s) => s.toJSON())
					}
				});
			}
		}
	}
}
