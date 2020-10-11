import { ShardEvent } from '@lib/structures/ShardEvent';
import { red } from 'colorette';
import { CloseEvent } from 'discord.js';

export default class extends ShardEvent {
	protected readonly title = red('Disconnected');

	public run(event: CloseEvent, id: number) {
		this.client.console.error(`${this.header(id)}:\n\tCode: ${event.code}\n\tReason: ${event.reason}`);
	}
}
