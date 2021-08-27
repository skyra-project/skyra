import { AudioListener, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioListener extends AudioListener {
	public run(queue: Queue) {
		return this.broadcastMessageForGuild(queue.guildId, async () => ({
			action: OutgoingWebSocketAction.MusicSync,
			data: { status: await queue.nowPlaying(), tracks: await queue.decodedTracks() }
		}));
	}
}
