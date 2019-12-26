import { Event, Colors } from 'klasa';
import { LavalinkWebSocketClosedEvent } from '../../lib/util/LavalinkUtils';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { Events } from '../../lib/types/Enums';

export default class extends Event {

	private kHeader = new Colors({ text: 'red' }).format('[LAVALINK]');

	public run(manager: MusicHandler, payload: LavalinkWebSocketClosedEvent) {
		if (payload.code >= 4000) {
			this.client.emit(Events.Error, [
				`${this.kHeader} Websocket Close (${manager.guild.id})`,
				`           Code  : ${payload.code}`,
				`           Reason: ${payload.reason}`
			]);
		}

		manager.reset(true);
	}

}
