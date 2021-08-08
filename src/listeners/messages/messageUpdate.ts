import { Events } from '#lib/types/Enums';
import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserListener extends Listener {
	public run(old: Message, message: Message) {
		// If the contents of both messages are the same, return:
		if (old.content === message.content) return;

		// If the message was sent by a webhook, return:
		if (message.webhookId !== null) return;

		// If the message was sent by the system, return:
		if (message.system) return;

		// If the message was sent by a bot, return:
		if (message.author.bot) return;

		// Run the message parser.
		this.container.client.emit(Events.PreMessageParsed, message);

		// Emit UserMessage
		this.container.client.emit(Events.UserMessage, message);
	}
}
