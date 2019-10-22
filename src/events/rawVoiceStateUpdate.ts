import { Event, EventOptions } from 'klasa';
import { VoiceStateUpdate } from 'lavalink';
import { Events } from '../lib/types/Enums';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<EventOptions>({
	name: 'VOICE_STATE_UPDATE',
	emitter: 'ws'
})
export default class extends Event {

	public async run(data: VoiceStateUpdate): Promise<void> {
		try {
			await this.client.lavalink!.voiceStateUpdate(data);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

	public init() {
		if (!this.client.lavalink) this.disable();
		return Promise.resolve();
	}

}
