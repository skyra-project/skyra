import { SkyraCommand } from '#lib/structures';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.CommandSuccess })
export default class extends Event {
	public run(_message: Message, command: SkyraCommand) {
		this.context.client.emit(Events.CommandUsageAnalytics, command.name, command.category, command.subCategory);
	}
}
