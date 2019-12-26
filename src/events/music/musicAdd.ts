import { Event } from 'klasa';
import { MusicHandler, MusicHandlerRequestContext } from '../../lib/structures/music/MusicHandler';
import { Song } from '../../lib/structures/music/Song';
import { floatPromise } from '../../lib/util/util';
import { OutgoingWebsocketAction } from '../../lib/websocket/types';

export default class extends Event {

	public run(manager: MusicHandler, songs: readonly Song[], context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(this, channel.sendMessage(songs.length === 1
				? channel.guild.language.tget('COMMAND_ADD_SONG', songs[0].safeTitle)
				: channel.guild.language.tget('COMMAND_ADD_PLAYLIST', songs.length)));
		}

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicAdd, data: songs });
		}
	}

}
