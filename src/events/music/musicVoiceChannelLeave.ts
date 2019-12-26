import { Event } from 'klasa';
import { MusicHandler } from '../../lib/structures/music/MusicHandler';
import { OutgoingWebsocketAction } from '../../lib/websocket/types';

export default class extends Event {

	public async run(manager: MusicHandler) {
		await manager.pause(true);

		for (const subscription of manager.websocketUserIterator()) {
			subscription.send({ action: OutgoingWebsocketAction.MusicVoiceChannelLeave });
		}
	}

}
