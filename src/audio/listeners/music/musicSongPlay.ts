import { AudioListener, NP, OutgoingWebSocketAction, Queue } from '#lib/audio';
import { Events } from '#lib/types/Enums';

export class UserAudioListener extends AudioListener {
	public async run(queue: Queue, status: NP) {
		const channel = await queue.getTextChannel();
		if (channel) this.container.client.emit(Events.MusicSongPlayNotify, channel, status.entry);

		return this.broadcastMessageForGuild(queue.guildId, async () => ({
			action: OutgoingWebSocketAction.MusicSync,
			data: { status, tracks: await queue.decodedTracks() }
		}));
	}
}
