import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { Song } from '../../lib/structures/music/Song';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public run(manager: MusicHandler, songs: readonly Song[]) {
		const { channel } = manager;

		if (channel) {
			floatPromise(this, channel.sendMessage(songs.length === 1
				? channel.guild.language.tget('COMMAND_ADD_SONG', songs[0].safeTitle)
				: channel.guild.language.tget('COMMAND_ADD_PLAYLIST', songs.length)));
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
