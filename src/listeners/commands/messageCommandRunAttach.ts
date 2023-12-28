import type { SkyraCommand } from '#lib/structures';
import { setCommand } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.MessageCommandRun })
export class UserListener extends Listener<typeof Events.MessageCommandRun> {
	public run(message: Message, command: SkyraCommand) {
		setCommand(message, command);
	}
}
