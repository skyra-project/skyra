import { AudioEvent, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioEvent extends AudioEvent {
	public run(queue: Queue, next: number) {
		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebSocketAction.MusicSongVolumeUpdate,
			data: { volume: next }
		}));
	}
}
