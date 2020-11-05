import { Events } from '@lib/types/Enums';
import { Event, KlasaMessage } from 'klasa';

export default class extends Event {
	public run(message: KlasaMessage) {
		if (message.partial || !message.guild || message.author.bot) return;
		this.client.emit(Events.GuildMessageUpdate, message);
	}
}
