import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { Events } from '../../lib/types/Enums';

export default class extends Event {

	public run(manager: MusicHandler) {
		this.client.emit(Events.MusicSongFinish, manager, manager.song);
	}

}
