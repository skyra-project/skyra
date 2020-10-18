import { Queue } from '@lib/audio';
import { callOnceAsync } from '@lib/misc';
import { AudioEvent } from '@lib/structures/AudioEvent';
import { OutgoingWebsocketAction } from '@lib/websocket/types';

export default class extends AudioEvent {
	public async run(queue: Queue) {
		const getStatus = callOnceAsync(() => queue.current());
		for (const subscription of this.getWebSocketListenersFor(queue.guildID)) {
			subscription.send({ action: OutgoingWebsocketAction.MusicSongSeekUpdate, data: { status: await getStatus() } });
		}
	}
}
