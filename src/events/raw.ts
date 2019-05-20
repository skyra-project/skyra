import { WSEventType } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {

	public run(data: { t: WSEventType; d: unknown }) {
		this.client.rawEvents.run(data);
	}

}
