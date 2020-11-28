import { ShardEvent } from '#lib/structures/ShardEvent';
import { yellow } from 'colorette';

export default class extends ShardEvent {
	protected readonly title = yellow('Reconnecting');

	public run(id: number) {
		this.client.console.error(`${this.header(id)}: ${this.title}`);
	}
}
