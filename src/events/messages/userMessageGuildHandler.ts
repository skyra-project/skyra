import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.UserMessage })
export default class extends Event {
	public run(message: Message) {
		if (message.guild) this.context.client.emit(Events.GuildUserMessage, message);
	}
}
