import type { Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures';
import { OutgoingWebsocketAction } from '#lib/websocket/types';

export class UserAudioEvent extends AudioEvent {
	public async run(queue: Queue) {
		await queue.stop();

		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebsocketAction.MusicVoiceChannelLeave
		}));
	}
}
