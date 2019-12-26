import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';

export default class extends Event {

	public async run(manager: MusicHandler) {
		if (manager.systemPaused) {
			if (manager.listeners.length > 0) await manager.resume();
		} else if (manager.listeners.length === 0) {
			await manager.pause(true);
		}

		// TODO (Favna | Magna): Add WS handler
	}

}
