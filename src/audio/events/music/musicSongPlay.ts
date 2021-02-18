import { AudioEvent, NP, OutgoingWebSocketAction, Queue } from '#lib/audio';
import { Events } from '#lib/types/Enums';

export class UserAudioEvent extends AudioEvent {
	public async run(queue: Queue, status: NP) {
		const channel = await queue.getTextChannel();
		if (channel) this.context.client.emit(Events.MusicSongPlayNotify, channel, status.entry);

		return this.broadcastMessageForGuild(queue.guildID, async () => ({
			action: OutgoingWebSocketAction.MusicSync,
			data: { status, tracks: await queue.decodedTracks() }
		}));
	}
}
