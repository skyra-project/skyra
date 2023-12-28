import { Events } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.UserMessage })
export class UserListener extends Listener {
	public run(message: Message) {
		if (message.guild) this.container.client.emit(Events.GuildUserMessage, message);
	}
}
