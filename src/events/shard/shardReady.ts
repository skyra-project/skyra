import { ShardEvent } from '@lib/structures/ShardEvent';
import { green } from 'colorette';

export default class extends ShardEvent {
	protected readonly title = green('Ready');

	public run(id: number, unavailableGuilds: Set<string> | null) {
		this.client.console.error(`${this.header(id)}: ${unavailableGuilds?.size ?? 'Unknown'} Guilds`);
	}
}
