import { Command, Finalizer, KlasaMessage } from 'klasa';

export default class extends Finalizer {

	public async run(_message: KlasaMessage, command: Command) {
		await this.client.queries.insertCommandUseCounter(command.name);
	}

}
