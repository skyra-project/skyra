import { AudioListener, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioListener extends AudioListener {
	public run(queue: Queue) {
		return this.broadcastMessageForGuild(queue.guildId, async () => ({
			action: OutgoingWebSocketAction.MusicSongSeekUpdate,
			data: { status: await queue.nowPlaying() }
		}));
	}
}
