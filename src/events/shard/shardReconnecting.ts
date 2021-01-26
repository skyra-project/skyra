import { ShardEvent } from '#lib/structures';
import { yellow } from 'colorette';

export class UserShardEvent extends ShardEvent {
	protected readonly title = yellow('Reconnecting');

	public run(id: number) {
		this.context.client.logger.error(`${this.header(id)}: ${this.title}`);
	}
}
