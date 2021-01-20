import { Events } from '#lib/types/Enums';
import type { Message } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(message: Message) {
		if (message.partial || !message.guild || message.author.bot) return;
		this.context.client.emit(Events.GuildMessageDelete, message);
	}
}
