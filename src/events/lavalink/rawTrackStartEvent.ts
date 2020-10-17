import { Events } from '@lib/types/Enums';
import { IncomingEventStartPayload } from '@skyra/audio';
import { ApplyOptions } from '@skyra/decorators';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: 'TrackStartEvent' })
export default class extends Event {
	public run(payload: IncomingEventStartPayload) {
		const queue = this.client.audio.queues.get(payload.guildId);
		this.client.emit(Events.MusicSongPlay, queue, payload.track);
	}
}
