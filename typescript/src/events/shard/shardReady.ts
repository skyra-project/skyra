import { ShardEvent } from '#lib/structures';
import { green } from 'colorette';

export class UserShardEvent extends ShardEvent {
	protected readonly title = green('Ready');

	public run(id: number, unavailableGuilds: Set<string> | null) {
		this.context.client.logger.info(`${this.header(id)}: ${unavailableGuilds?.size ?? 'Unknown or no unavailable'} guilds`);
	}
}
