import { AudioEvent, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioEvent extends AudioEvent {
	public run(queue: Queue) {
		return this.broadcastMessageForGuild(queue.guildID, async () => ({
			action: OutgoingWebSocketAction.MusicSync,
			data: { status: await queue.nowPlaying(), tracks: await queue.decodedTracks() }
		}));
	}
}
