import { DbSet } from '@lib/structures/DbSet';
import { Command, Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {

	public async run(_message: KlasaMessage, command: Command) {
		const { commandCounters } = await DbSet.connect();
		await commandCounters.increment({ id: command.name }, 'uses', 1);
	}

}
