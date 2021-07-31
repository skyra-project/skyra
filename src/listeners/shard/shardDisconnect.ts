import { ShardListener } from '#lib/structures';
import { red } from 'colorette';
import type { CloseEvent } from 'discord.js';

export class UserShardListener extends ShardListener {
	protected readonly title = red('Disconnected');

	public run(event: CloseEvent, id: number) {
		this.container.logger.error(`${this.header(id)}:\n\tCode: ${event.code}\n\tReason: ${event.reason}`);
	}
}
