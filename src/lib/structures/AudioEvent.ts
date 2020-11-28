import { OutgoingWebsocketMessage } from '#lib/websocket/types';
import { Event } from 'klasa';

interface AudioBroadcastCallback {
	(): OutgoingWebsocketMessage | Promise<OutgoingWebsocketMessage>;
}

export abstract class AudioEvent extends Event {
	public *getWebSocketListenersFor(guildID: string) {
		for (const user of this.client.websocket.users.values()) {
			if (user.musicSubscriptions.subscribed(guildID)) yield user;
		}
	}

	public async broadcastMessageForGuild(guildID: string, cb: AudioBroadcastCallback) {
		const iterator = this.getWebSocketListenersFor(guildID);

		// Retrieve the first result:
		const firstResult = iterator.next();
		if (firstResult.done) return false;

		// Retrieve the data and send it to the first value:
		const data = await cb();
		firstResult.value.send(data);

		// Iterate over the rest of subscribers:
		for (const subscription of iterator) {
			subscription.send(data);
		}

		return true;
	}
}
