import { Events } from '#lib/types/Enums';
import { isGuildMessage } from '#utils/common';
import { Event } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserEvent extends Event {
	public run(message: Message) {
		if (message.partial || !isGuildMessage(message) || message.author.bot) return;
		this.context.client.emit(Events.GuildMessageDelete, message);
	}
}
