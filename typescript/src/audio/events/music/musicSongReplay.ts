import { AudioEvent, NP, OutgoingWebSocketAction, Queue } from '#lib/audio';

export class UserAudioEvent extends AudioEvent {
	public run(queue: Queue, status: NP) {
		return this.broadcastMessageForGuild(queue.guildID, async () => ({
			action: OutgoingWebSocketAction.MusicSync,
			data: { status, tracks: await queue.decodedTracks() }
		}));
	}
}
