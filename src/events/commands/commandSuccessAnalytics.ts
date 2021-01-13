import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { Message } from 'discord.js';
import { Command, Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.CommandSuccess })
export default class extends Event {
	public run(_message: Message, command: Command) {
		this.client.emit(Events.CommandUsageAnalytics, command.name, command.category, command.subCategory);
	}
}
