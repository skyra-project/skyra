import { Events } from '#lib/types/Enums';
import { Event } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserEvent extends Event {
	public run(old: Message, message: Message) {
		// If the contents of both messages are the same, return:
		if (old.content === message.content) return;

		// If the message was sent by a webhook, return:
		if (message.webhookID !== null) return;

		// If the message was sent by the system, return:
		if (message.system) return;

		// If the messaage was sent by a bot, return:
		if (message.author.bot) return;

		// Run the message parser.
		this.context.client.emit(Events.PreMessageParsed, message);

		// Emit UserMessage
		this.context.client.emit(Events.UserMessage, message);
	}
}
