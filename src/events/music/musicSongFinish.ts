import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { Events } from '../../lib/types/Enums';
import { floatPromise } from '../../lib/util/util';

export default class extends Event {

	public async run(manager: MusicHandler) {
		const { channel } = manager;

		if (manager.replay && manager.song !== null) {
			await manager.player.play(manager.song.track);
			manager.position = 0;
			manager.lastUpdate = 0;
			this.client.emit(Events.MusicSongReplay, this, manager.song);
			return;
		}

		if (manager.queue.length === 0) {
			await manager.player.leave();
			if (channel) floatPromise(this, channel.sendLocale('COMMAND_PLAY_END'));
		} else {
			manager.reset();
			try {
				manager.song = manager.queue.shift()!;
				await manager.player.play(manager.song.track);

				this.client.emit(Events.MusicSongPlay, manager, manager.song);
			} catch (error) {
				this.client.emit(Events.Wtf, error);
			}
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
