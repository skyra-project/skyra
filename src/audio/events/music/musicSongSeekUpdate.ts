import { AudioEvent, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioEvent extends AudioEvent {
	public run(queue: Queue) {
		return this.broadcastMessageForGuild(queue.guildID, async () => ({
			action: OutgoingWebSocketAction.MusicSongSeekUpdate,
			data: { status: await queue.nowPlaying() }
		}));
	}
}
