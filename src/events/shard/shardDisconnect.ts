import { ShardEvent } from '@lib/structures/ShardEvent';
import { red } from 'colorette';

export default class extends ShardEvent {
	protected readonly title = red('Disconnected');

	public run(event: number, id: number) {
		this.client.console.error(`${this.header(id)}: Close Event ${event}`);
	}
}
