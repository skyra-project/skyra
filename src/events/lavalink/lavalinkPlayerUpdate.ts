import { Event } from 'klasa';
import { LavalinkPlayerUpdateEvent } from '../../lib/util/LavalinkUtils';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';

export default class extends Event {

	public run(manager: MusicHandler, payload: LavalinkPlayerUpdateEvent) {
		manager.position = payload.state.position;
		manager.lastUpdate = payload.state.time;
	}

}
