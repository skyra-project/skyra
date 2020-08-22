import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { Song } from '@lib/structures/music/Song';
import { Events } from '@lib/types/Enums';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { floatPromise } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public async run(manager: MusicHandler, song: Song | null, context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (manager.replay && manager.song !== null) {
			await manager.player?.play(manager.song.track);
			manager.position = 0;
			manager.lastUpdate = 0;
			this.client.emit(Events.MusicSongReplay, manager, manager.song);
			return;
		}

		if (song !== null) {
			for (const subscription of manager.websocketUserIterator()) {
				subscription.send({ action: OutgoingWebsocketAction.MusicSongFinish, data: { queue: manager.queue.map((s) => s.toJSON()) } });
			}
		}

		manager.reset();
		if (manager.queue.length === 0) {
			floatPromise(this, channel!.sendLocale('commandPlayEnd'));
			await this.client.lavalink.leave(channel!.guild.id);
		} else {
			try {
				manager.song = manager.queue.shift()!;
				await manager.player?.play(manager.song.track);
			} catch (error) {
				this.client.emit(Events.Wtf, error);
			}
		}
	}
}
