import type { SkyraCommand } from '#lib/structures';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.CommandRun })
export class UserEvent extends Event<Events.CommandRun> {
	public run(message: Message, command: SkyraCommand) {
		message.command = command;
	}
}
