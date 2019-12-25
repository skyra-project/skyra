import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { Events } from '../../lib/types/Enums';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public async run(manager: MusicHandler) {
		const { channel } = manager;

		if (manager.replay && manager.song !== null) {
			await manager.player.play(manager.song.track);
			this.client.emit(Events.MusicSongReplay, this, manager.song);
			return;
		}

		manager.reset();
		if (manager.queue.length === 0 && channel) {
			await manager.leave();
			floatPromise(this, channel.sendLocale('COMMAND_PLAY_END'));
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
