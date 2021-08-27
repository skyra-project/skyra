import { AudioListener, Queue } from '#lib/audio';
import { Events } from '#lib/types/Enums';

export class UserAudioListener extends AudioListener {
	public run(queue: Queue) {
		this.container.client.emit(Events.MusicQueueSync, queue);
	}
}
