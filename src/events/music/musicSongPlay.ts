import { NP, Queue } from '@lib/audio';
import { callOnceAsync } from '@lib/misc';
import { AudioEvent } from '@lib/structures/AudioEvent';
import { Events } from '@lib/types/Enums';
import { OutgoingWebsocketAction } from '@lib/websocket/types';

export default class extends AudioEvent {
	public async run(queue: Queue, status: NP) {
		const channel = await queue.textChannel();
		if (channel) this.client.emit(Events.MusicSongPlayNotify, channel, status.entry);

		const getTracks = callOnceAsync(() => queue.decodedTracks());
		for (const subscription of this.getWebSocketListenersFor(queue.guildID)) {
			subscription.send({ action: OutgoingWebsocketAction.MusicSongPlay, data: { status, tracks: await getTracks() } });
		}
	}
}
