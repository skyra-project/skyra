import { Event } from 'klasa';
import { OutgoingWebsocketAction } from '../../lib/websocket/types';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { Song } from '../../lib/structures/music/Song';

export default class extends Event {

	public run(manager: MusicHandler, song: Song) {
		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicSongReplay, data: song });
		}
	}

}
