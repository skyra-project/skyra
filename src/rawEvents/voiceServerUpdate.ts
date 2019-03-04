import { VoiceServerUpdate } from 'lavalink';
import { RawEvent } from '../lib/structures/RawEvent';
import { Events } from '../lib/types/Enums';

export default class extends RawEvent {

	public async run(data: VoiceServerUpdate): Promise<void> {
		try {
			await this.client.lavalink.voiceServerUpdate(data);
		} catch (error) {
			this.client.emit(Events.Error, error);
		}
	}

}
