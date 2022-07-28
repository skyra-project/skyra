import { ShardListener } from '#lib/structures';
import { green } from 'colorette';

export class UserShardListener extends ShardListener {
	protected readonly title = green('Ready');

	public run(id: number, unavailableGuilds: Set<string> | null) {
		this.container.logger.info(`${this.header(id)}: ${unavailableGuilds?.size ?? 'Unknown or no unavailable'} guilds`);
	}
}
