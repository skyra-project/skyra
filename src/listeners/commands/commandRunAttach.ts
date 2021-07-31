import type { SkyraCommand } from '#lib/structures';
import { setCommand } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.CommandRun })
export class UserListener extends Listener<typeof Events.CommandRun> {
	public run(message: Message, command: SkyraCommand) {
		setCommand(message, command);
	}
}
