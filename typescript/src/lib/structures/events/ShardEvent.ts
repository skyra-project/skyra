import { Event } from '@sapphire/framework';
import { bold, magenta } from 'colorette';

export abstract class ShardEvent extends Event {
	protected abstract readonly title: string;

	protected header(shardID: number): string {
		return `${bold(magenta(`[SHARD ${shardID}]`))} ${this.title}`;
	}
}
