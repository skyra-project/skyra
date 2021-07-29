import { ShardEvent } from '#lib/structures';
import { red } from 'colorette';
import type { CloseEvent } from 'discord.js';

export class UserShardEvent extends ShardEvent {
	protected readonly title = red('Disconnected');

	public run(event: CloseEvent, id: number) {
		this.context.client.logger.error(`${this.header(id)}:\n\tCode: ${event.code}\n\tReason: ${event.reason}`);
	}
}
