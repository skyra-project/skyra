import { Event } from 'klasa';
import { MusicHandler } from '@lib/structures/music/MusicHandler';

export default class extends Event {

	public run(manager: MusicHandler) {
		manager.reset(true);
	}

}
