import { Node, NodeOptions, NodeSend } from '@skyra/audio';
import * as Redis from 'ioredis';
import { QueueStore } from './QueueStore';

export interface QueueClientOptions extends NodeOptions {
	redis: Redis.Redis | Redis.RedisOptions;
}

export class QueueClient extends Node {
	public readonly queues: QueueStore;

	public constructor(options: QueueClientOptions, send: NodeSend) {
		super(options, send);
		this.queues = new QueueStore(this, options.redis instanceof Redis ? options.redis : new Redis(options.redis));

		for (const name of ['event', 'playerUpdate']) {
			this.on(name, (d) => {
				this.queues.get(d.guildId).emit(name, d);
			});
		}
	}
}
