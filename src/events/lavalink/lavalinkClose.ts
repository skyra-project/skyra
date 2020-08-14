import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler) {
		manager.reset(true);
	}
}
