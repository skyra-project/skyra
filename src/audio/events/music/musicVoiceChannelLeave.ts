import { AudioEvent, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioEvent extends AudioEvent {
	public async run(queue: Queue) {
		await queue.stop();

		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebSocketAction.MusicVoiceChannelLeave
		}));
	}
}
