import { AudioListener, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioListener extends AudioListener {
	public async run(queue: Queue) {
		await queue.stop();

		return this.broadcastMessageForGuild(queue.guildId, () => ({
			action: OutgoingWebSocketAction.MusicVoiceChannelLeave
		}));
	}
}
