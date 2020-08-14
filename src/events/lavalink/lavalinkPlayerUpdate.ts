import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { LavalinkPlayerUpdateEvent } from '@utils/LavalinkUtils';
import { Event } from 'klasa';

export default class extends Event {
	public run(manager: MusicHandler, payload: LavalinkPlayerUpdateEvent) {
		manager.position = payload.state.position;
		manager.lastUpdate = payload.state.time;
	}
}
