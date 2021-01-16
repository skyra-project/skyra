import type { Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { OutgoingWebsocketAction } from '#lib/websocket/types';

export default class extends AudioEvent {
	public run(queue: Queue, voiceChannelID: string) {
		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebsocketAction.MusicConnect,
			data: { voiceChannel: voiceChannelID }
		}));
	}
}
