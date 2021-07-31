import { envParseBoolean } from '#lib/env';
import { Listener, ListenerOptions, PieceContext } from '@sapphire/framework';
import type { OutgoingWebSocketMessage } from '../websocket/Shared';

interface AudioBroadcastCallback {
	(): OutgoingWebSocketMessage | Promise<OutgoingWebSocketMessage>;
}

export abstract class AudioListener extends Listener {
	public constructor(context: PieceContext, options: AudioListener.Options = {}) {
		super(context, { ...options, enabled: envParseBoolean('AUDIO_ENABLED') });
	}

	public *getWebSocketListenersFor(guildId: string) {
		for (const user of this.container.client.websocket.users.values()) {
			if (user.musicSubscriptions.subscribed(guildId)) yield user;
		}
	}

	public async broadcastMessageForGuild(guildId: string, cb: AudioBroadcastCallback) {
		const iterator = this.getWebSocketListenersFor(guildId);

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

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AudioListener {
	export type Options = ListenerOptions;
}
