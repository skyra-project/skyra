import { AudioListener, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioListener extends AudioListener {
	public run(queue: Queue, voiceChannelId: string) {
		return this.broadcastMessageForGuild(queue.guildId, () => ({
			action: OutgoingWebSocketAction.MusicConnect,
			data: { voiceChannel: voiceChannelId }
		}));
	}
}
