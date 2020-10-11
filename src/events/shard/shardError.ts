import { ShardEvent } from '@lib/structures/ShardEvent';
import { red } from 'colorette';

export default class extends ShardEvent {
	protected readonly title = red('Error');

	public run(error: Error, id: number) {
		this.client.console.error(`${this.header(id)}: ${error.message}`);
	}
}
