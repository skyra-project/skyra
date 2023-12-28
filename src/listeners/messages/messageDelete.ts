import { Events } from '#lib/types';
import { isGuildMessage } from '#utils/common';
import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserListener extends Listener {
	public run(message: Message) {
		if (message.partial || !isGuildMessage(message) || message.author.bot) return;
		this.container.client.emit(Events.GuildMessageDelete, message);
	}
}
