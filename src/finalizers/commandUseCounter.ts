import { Events } from '#lib/types/Enums';
import { Message } from 'discord.js';
import { Command, Finalizer } from 'klasa';

export default class extends Finalizer {
	public run(_message: Message, command: Command) {
		this.client.emit(Events.CommandUsageAnalytics, command.name, command.category, command.subCategory);
	}
}
