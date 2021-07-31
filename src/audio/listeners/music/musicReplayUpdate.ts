import { AudioListener, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioListener extends AudioListener {
	public run(queue: Queue, repeating: boolean) {
		this.broadcastMessageForGuild(queue.guildId, () => ({
			action: OutgoingWebSocketAction.MusicReplayUpdate,
			data: { replay: repeating }
		}));
	}
}
