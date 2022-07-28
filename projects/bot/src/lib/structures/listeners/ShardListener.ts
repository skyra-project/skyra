import { Listener } from '@sapphire/framework';
import { bold, magenta } from 'colorette';

export abstract class ShardListener extends Listener {
	protected abstract readonly title: string;

	protected header(shardId: number): string {
		return `${bold(magenta(`[SHARD ${shardId}]`))} ${this.title}`;
	}
}
