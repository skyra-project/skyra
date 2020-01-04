import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { Events } from '@lib/types/Enums';
import { floatPromise } from '@util/util';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { Song } from '@lib/structures/music/Song';

export default class extends Event {

	public async run(manager: MusicHandler, song: Song | null, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (manager.replay && manager.song !== null) {
			await manager.player.play(manager.song.track);
			manager.position = 0;
			manager.lastUpdate = 0;
			this.client.emit(Events.MusicSongReplay, this, manager.song);
			return;
		}

		manager.reset();
		if (manager.queue.length === 0) {
			await manager.player.leave();
			if (channel) floatPromise(this, channel.sendLocale('COMMAND_PLAY_END'));
		} else {
			try {
				manager.song = manager.queue.shift()!;
				await manager.player.play(manager.song.track);

				this.client.emit(Events.MusicSongPlay, manager, manager.song);
			} catch (error) {
				this.client.emit(Events.Wtf, error);
			}
		}

		if (song !== null) {
			for (const subscription of manager.websocketUserIterator()) {
				subscription.send({ action: OutgoingWebsocketAction.MusicSongFinish, data: { id: song.id } });
			}
		}
	}

}
