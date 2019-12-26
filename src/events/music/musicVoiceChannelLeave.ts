import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';

export default class extends Event {

	public async run(manager: MusicHandler) {
		await manager.pause(true);

		// TODO (Favna | Magna): Add WS handler
	}

}
