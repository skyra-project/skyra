import type { Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures';
import { OutgoingWebsocketAction } from '#lib/websocket/types';

export class UserAudioEvent extends AudioEvent {
	public run(queue: Queue, voiceChannelID: string) {
		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebsocketAction.MusicConnect,
			data: { voiceChannel: voiceChannelID }
		}));
	}
}
