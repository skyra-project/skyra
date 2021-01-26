import { AudioEvent } from '#lib/structures';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventTrackEndPayload } from '@skyra/audio';

@ApplyOptions<AudioEvent.Options>({ event: 'TrackEndEvent' })
export class UserAudioEvent extends AudioEvent {
	public async run(payload: IncomingEventTrackEndPayload) {
		const queue = this.context.client.audio.queues!.get(payload.guildId);
		this.store.context.client.emit(Events.MusicQueueSync, queue);

		// If the track wasn't replaced nor stopped, play next track:
		if (payload.reason !== 'REPLACED' && payload.reason !== 'STOPPED') {
			await queue.next();
		}
	}
}
