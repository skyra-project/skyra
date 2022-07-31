import { isNullishOrEmpty, type Nullish } from '@sapphire/utilities';
import type { Redis } from 'ioredis';
import { deserialize, serialize } from 'node:v8';
import { RedisMessage } from './RedisMessage';

export class MessageBroker {
	public readonly redis: Redis;
	public readonly stream: string;
	private readonly block: string;
	private readonly max: string;
	private readonly serialize: Serializer;
	private readonly deserialize: Deserializer;
	private readonly redisReader: Redis;
	private listenStream: AsyncGenerator<RedisMessage> | null = null;

	public constructor(options: MessageBroker.Options) {
		this.redis = options.redis;
		this.stream = options.stream;
		this.block = String(options.block ?? 5000);
		this.max = String(options.max ?? 10);
		this.serialize = options.serialize ?? serialize;
		this.deserialize = options.deserialize ?? deserialize;
		this.redisReader = this.redis.duplicate();
	}

	public send(value: unknown) {
		return this.redis.xadd(this.stream, '*', MessageBroker.STREAM_DATA_FIELD, this.serialize(value));
	}

	public listen(): AsyncGenerator<RedisMessage> {
		return (this.listenStream ??= this.handleListen());
	}

	public disconnect() {
		this.redisReader.disconnect(false);
	}

	private async *handleListen(): AsyncGenerator<RedisMessage> {
		while (true) {
			const data = await this.redisReader.xreadBuffer('COUNT', this.max, 'BLOCK', this.block, 'STREAMS', this.stream, '>');
			if (isNullishOrEmpty(data)) continue;

			for (const [streamId, items] of data) {
				for (const [entryId, fields] of items) {
					// The broker sends 1 pair of fields, so anything different is invalid.
					if (fields.length !== 2) continue;

					// Verify that the key of the pair of fields is the data the broker sends.
					if (fields[0].toString('utf8') !== MessageBroker.STREAM_DATA_FIELD) continue;

					yield new RedisMessage(this, streamId, entryId, this.deserialize(fields[1]));
				}
			}
		}
	}

	private static readonly STREAM_DATA_FIELD = 'data';
}

export namespace MessageBroker {
	export interface Options {
		redis: Redis;
		stream: string;
		block?: number | Nullish;
		max?: number | Nullish;
		serialize?: Serializer;
		deserialize?: Deserializer;
	}
}

export interface Serializer {
	(value: unknown): Buffer;
}

export interface Deserializer {
	(value: Buffer): unknown;
}
