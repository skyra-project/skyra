import { AudioListener, NP, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioListener extends AudioListener {
	public run(queue: Queue, status: NP) {
		return this.broadcastMessageForGuild(queue.guildId, async () => ({
			action: OutgoingWebSocketAction.MusicSync,
			data: { status, tracks: await queue.decodedTracks() }
		}));
	}
}
