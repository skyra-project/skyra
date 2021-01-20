import { ShardEvent } from '#lib/structures';
import { red } from 'colorette';
import type { CloseEvent } from 'discord.js';

export default class extends ShardEvent {
	protected readonly title = red('Disconnected');

	public run(event: CloseEvent, id: number) {
		this.context.client.console.error(`${this.header(id)}:\n\tCode: ${event.code}\n\tReason: ${event.reason}`);
	}
}
