import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { Song } from '@lib/structures/music/Song';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, song: Song) {
		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicSongReplay, data: { song: song.toJSON() } });
		}
	}
}
