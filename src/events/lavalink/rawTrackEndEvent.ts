import { Events } from '@lib/types/Enums';
import { IncomingEventTrackEndPayload } from '@skyra/audio';
import { ApplyOptions } from '@skyra/decorators';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: 'TrackEndEvent' })
export default class extends Event {
	public async run(payload: IncomingEventTrackEndPayload) {
		const queue = this.client.audio.queues!.get(payload.guildId);
		this.store.client.emit(Events.MusicQueueSync, queue);

		// If the track wasn't replaced nor stopped, play next track:
		if (payload.reason !== 'REPLACED' && payload.reason !== 'STOPPED') {
			await queue.next();
		}
	}
}
