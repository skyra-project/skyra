import type { Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures';
import { Events } from '#lib/types/Enums';

export class UserAudioEvent extends AudioEvent {
	public run(queue: Queue) {
		this.context.client.emit(Events.MusicQueueSync, queue);
	}
}
