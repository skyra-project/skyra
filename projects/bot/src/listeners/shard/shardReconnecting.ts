import { ShardListener } from '#lib/structures';
import { yellow } from 'colorette';

export class UserShardListener extends ShardListener {
	protected readonly title = yellow('Reconnecting');

	public run(id: number) {
		this.container.logger.error(`${this.header(id)}: ${this.title}`);
	}
}
