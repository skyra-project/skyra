import { ShardListener } from '#lib/structures';
import { red } from 'colorette';

export class UserShardListener extends ShardListener {
	protected readonly title = red('Error');

	public run(error: Error, id: number) {
		this.container.logger.error(`${this.header(id)}: ${error.stack ?? error.message}`);
	}
}
