import type { Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { Events } from '#lib/types/Enums';
import { OutgoingWebsocketAction } from '#lib/websocket/types';

export default class extends AudioEvent {
	public async run(queue: Queue) {
		const channel = await queue.getTextChannel();
		if (channel) this.context.client.emit(Events.MusicFinishNotify, channel);

		await queue.leave();
		await queue.clear();

		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebsocketAction.MusicFinish
		}));
	}
}
