import { Event, EventOptions } from 'klasa';
import { VoiceServerUpdate } from 'lavalink';
import { Events } from '../lib/types/Enums';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<EventOptions>({
	name: 'VOICE_SERVER_UPDATE',
	emitter: 'ws'
})
export default class extends Event {

	public async run(data: VoiceServerUpdate): Promise<void> {
		try {
			await this.client.lavalink!.voiceServerUpdate(data);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

	public init() {
		if (!this.client.lavalink) this.disable();
		return Promise.resolve();
	}

}
