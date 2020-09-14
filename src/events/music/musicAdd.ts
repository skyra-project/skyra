import { MusicHandler, MusicHandlerRequestContext } from '@lib/structures/music/MusicHandler';
import { Song } from '@lib/structures/music/Song';
import { OutgoingWebsocketAction } from '@lib/websocket/types';
import { floatPromise } from '@utils/util';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, songs: readonly Song[], context: MusicHandlerRequestContext | null) {
		const channel = context ? context.channel : manager.channel;

		if (channel) {
			floatPromise(
				this,
				channel.sendMessage(
					songs.length === 1
						? channel.guild.language.get('commandAddSong', { title: songs[0].safeTitle })
						: channel.guild.language.get('commandAddPlaylist', {
								songs: channel.guild.language.get(songs.length === 1 ? 'commandAddPlaylistSongs' : 'commandAddPlaylistSongsPlural', {
									count: songs.length
								})
						  }),
					{ allowedMentions: { users: [], roles: [] } }
				)
			);
		}

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicAdd, data: { queue: manager.queue.map((s) => s.toJSON()) } });
		}
	}
}
