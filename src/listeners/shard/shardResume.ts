import { ShardListener } from '#lib/structures';
import { yellow } from 'colorette';

export class UserShardListener extends ShardListener {
	protected readonly title = yellow('Resumed');

	public run(id: number, replayedEvents: number) {
		this.container.logger.info(`${this.header(id)}: ${replayedEvents} events replayed.`);
	}
}
