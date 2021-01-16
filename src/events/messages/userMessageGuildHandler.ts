import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.UserMessage })
export default class extends Event {
	public run(message: Message) {
		if (message.guild) this.client.emit(Events.GuildUserMessage, message);
	}
}
