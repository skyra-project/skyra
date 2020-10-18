import { Event } from 'klasa';

export abstract class AudioEvent extends Event {
	public *getWebSocketListenersFor(guildID: string) {
		for (const user of this.client.websocket.users.values()) {
			if (user.musicSubscriptions.subscribed(guildID)) yield user;
		}
	}
}
