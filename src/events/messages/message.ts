import { Events } from '#lib/types/Enums';
import { Event } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserEvent extends Event {
	public run(message: Message) {
		// If the message was sent by a webhook, return:
		if (message.webhookID !== null) return;

		// If the message was sent by the system, return:
		if (message.system) return;

		// If the messaage was sent by a bot, return:
		if (message.author.bot) return;

		// Emit UserMessage
		this.context.client.emit(Events.UserMessage, message);
	}
}
