import { Events } from '@lib/types/Enums';
import { Command, Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {

	public async run(message: KlasaMessage, command: Command) {
		await this.client.emit(Events.CommandUsageAnalytics,
			command.name,
			command.category,
			command.subCategory,
			message.author.id,
			message.guild?.id);
	}

}
