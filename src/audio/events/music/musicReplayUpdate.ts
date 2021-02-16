import { AudioEvent, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioEvent extends AudioEvent {
	public run(queue: Queue, repeating: boolean) {
		this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebSocketAction.MusicReplayUpdate,
			data: { replay: repeating }
		}));
	}
}
