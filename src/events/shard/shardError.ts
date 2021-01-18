import { ShardEvent } from '#lib/structures/events/ShardEvent';
import { red } from 'colorette';

export default class extends ShardEvent {
	protected readonly title = red('Error');

	public run(error: Error, id: number) {
		this.context.client.console.error(`${this.header(id)}: ${error.stack ?? error.message}`);
	}
}
