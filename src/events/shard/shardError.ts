import { ShardEvent } from '#lib/structures';
import { red } from 'colorette';

export class UserShardEvent extends ShardEvent {
	protected readonly title = red('Error');

	public run(error: Error, id: number) {
		this.context.client.logger.error(`${this.header(id)}: ${error.stack ?? error.message}`);
	}
}
