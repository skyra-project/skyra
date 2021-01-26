import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.MessageDelete })
export class UserEvent extends Event {
	public async run(message: Message) {
		for (const response of message.responses) {
			await response.nuke();
		}
	}
}
