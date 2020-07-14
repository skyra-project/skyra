import { DbSet } from '@lib/structures/DbSet';
import { Command, Finalizer, KlasaMessage } from 'klasa';
import { DbSet } from '@lib/structures/DbSet';
import { Events } from '@lib/types/Enums';

export default class extends Finalizer {
	public async run(message: KlasaMessage, command: Command) {
		const { commandCounters } = await DbSet.connect();
		await commandCounters.increment({ id: command.name }, 'uses', 1);

		await this.client.emit(Events.CommandUsageAnalytics,
			command.name,
			command.category,
			command.subCategory,
			message.author.id,
			message.guild?.id);
	}

}
