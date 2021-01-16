import type { NP, Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { OutgoingWebsocketAction } from '#lib/websocket/types';

export default class extends AudioEvent {
	public run(queue: Queue, status: NP) {
		return this.broadcastMessageForGuild(queue.guildID, async () => ({
			action: OutgoingWebsocketAction.MusicSync,
			data: { status, tracks: await queue.decodedTracks() }
		}));
	}
}
