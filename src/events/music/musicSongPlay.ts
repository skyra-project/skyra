import { NP, Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { Events } from '#lib/types/Enums';
import { OutgoingWebsocketAction } from '#lib/websocket/types';

export default class extends AudioEvent {
	public async run(queue: Queue, status: NP) {
		const channel = await queue.getTextChannel();
		if (channel) this.client.emit(Events.MusicSongPlayNotify, channel, status.entry);

		return this.broadcastMessageForGuild(queue.guildID, async () => ({
			action: OutgoingWebsocketAction.MusicSync,
			data: { status, tracks: await queue.decodedTracks() }
		}));
	}
}
