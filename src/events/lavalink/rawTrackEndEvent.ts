import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { IncomingEventTrackEndPayload } from '@skyra/audio';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: 'TrackEndEvent' })
export default class extends Event {
	public async run(payload: IncomingEventTrackEndPayload) {
		const queue = this.context.client.audio.queues!.get(payload.guildId);
		this.store.context.client.emit(Events.MusicQueueSync, queue);

		// If the track wasn't replaced nor stopped, play next track:
		if (payload.reason !== 'REPLACED' && payload.reason !== 'STOPPED') {
			await queue.next();
		}
	}
}
