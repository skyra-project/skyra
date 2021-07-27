import { AudioEvent, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioEvent extends AudioEvent {
	public run(queue: Queue, voiceChannelID: string) {
		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebSocketAction.MusicConnect,
			data: { voiceChannel: voiceChannelID }
		}));
	}
}
