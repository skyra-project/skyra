import { ShardEvent } from '#lib/structures';
import { yellow } from 'colorette';

export default class extends ShardEvent {
	protected readonly title = yellow('Resumed');

	public run(id: number, replayedEvents: number) {
		this.context.client.logger.error(`${this.header(id)}: ${replayedEvents} events replayed.`);
	}
}
