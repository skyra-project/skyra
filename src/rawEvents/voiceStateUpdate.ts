import { VoiceStateUpdate } from 'lavalink';
import { RawEvent } from '../lib/structures/RawEvent';
import { Events } from '../lib/types/Enums';

export default class extends RawEvent {

	public async run(data: VoiceStateUpdate): Promise<void> {
		try {
			await this.client.lavalink.voiceStateUpdate(data);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

}
