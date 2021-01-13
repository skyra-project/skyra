import { Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { Events } from '#lib/types/Enums';

export default class extends AudioEvent {
	public run(queue: Queue) {
		this.client.emit(Events.MusicQueueSync, queue);
	}
}
