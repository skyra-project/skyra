import { Queue } from '@lib/audio';
import { AudioEvent } from '@lib/structures/AudioEvent';
import { Events } from '@lib/types/Enums';
import { OutgoingWebsocketAction } from '@lib/websocket/types';

export default class extends AudioEvent {
	public async run(queue: Queue) {
		const channel = await queue.getTextChannel();
		if (channel) this.client.emit(Events.MusicFinishNotify, channel);

		await queue.leave();
		await queue.clear();

		for (const subscription of this.getWebSocketListenersFor(queue.guildID)) {
			subscription.send({ action: OutgoingWebsocketAction.MusicFinish });
		}
	}
}
