import { Events } from '@lib/types/Enums';
import { Command, Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {
	public run(_message: KlasaMessage, command: Command) {
		this.client.emit(Events.CommandUsageAnalytics, command.name, command.category, command.subCategory);
	}
}
