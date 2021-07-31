import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.UserMessage })
export class UserListener extends Listener {
	public run(message: Message) {
		if (message.guild) this.container.client.emit(Events.GuildUserMessage, message);
	}
}
