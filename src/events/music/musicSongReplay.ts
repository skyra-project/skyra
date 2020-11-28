import { NP, Queue } from '#lib/audio/index';
import { AudioEvent } from '#lib/structures/AudioEvent';
import { OutgoingWebsocketAction } from '#lib/websocket/types';

export default class extends AudioEvent {
	public run(queue: Queue, status: NP) {
		return this.broadcastMessageForGuild(queue.guildID, async () => ({
			action: OutgoingWebsocketAction.MusicSync,
			data: { status, tracks: await queue.decodedTracks() }
		}));
	}
}
