import { Result } from '@sapphire/result';
import { isNullishOrEmpty, type Nullish } from '@sapphire/utilities';
import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import type { Redis } from 'ioredis';
import { deserialize, serialize } from 'node:v8';
import { RedisMessage } from './RedisMessage.js';

export class MessageBroker extends AsyncEventEmitter<{
	message: [message: RedisMessage];
}> {
	public readonly redis: Redis;
	public readonly stream: string;
	private readonly block: string;
	private readonly max: string;
	private readonly serialize: Serializer;
	private readonly deserialize: Deserializer;
	private redisReader: Redis | null = null;
	private listening = false;
	private lastId = '$';

	public constructor(options: MessageBroker.Options) {
		super();

		this.redis = options.redis;
		this.stream = options.stream;
		this.block = String(options.block ?? 5000);
		this.max = String(options.max ?? 10);
		this.serialize = options.serialize ?? serialize;
		this.deserialize = options.deserialize ?? deserialize;
	}

	public send(value: RedisMessage.Data) {
		return this.redis.xadd(this.stream, '*', MessageBroker.STREAM_DATA_FIELD, this.serialize(value));
	}

	public listen() {
		if (this.listening) return false;

		void this.handleListen();
		return true;
	}

	public disconnect() {
		this.listening = false;
		this.redisReader?.disconnect(false);
	}

	private async handleListen() {
		if (this.redisReader) throw new Error('The reader is already active');
		this.redisReader = this.redis.duplicate();
		this.listening = true;

		while (this.listening) {
			const result = await Result.fromAsync(
				this.redisReader.xreadBuffer('COUNT', this.max, 'BLOCK', this.block, 'STREAMS', this.stream, this.lastId)
			);

			result.match({
				ok: (data) => this.handleBulk(data),
				err: (error) => this.handleError(error)
			});
		}

		this.lastId = '$';
		this.redisReader = null;
	}

	private handleBulk(data: [key: Buffer, items: [id: Buffer, fields: Buffer[]][]][] | null) {
		if (isNullishOrEmpty(data)) return;

		for (const [streamIdBuffer, items] of data) {
			const streamId = streamIdBuffer.toString('utf8');

			// Verify that the stream is the one the application is listening for.
			if (streamId !== this.stream) continue;

			for (const [entryIdBuffer, fields] of items) {
				const entryId = entryIdBuffer.toString('utf8');
				this.lastId = entryId;

				// The broker sends 1 pair of fields, so anything different is invalid.
				if (fields.length !== 2) continue;

				// Verify that the key of the pair of fields is the data the broker sends.
				if (fields[0].toString('utf8') !== MessageBroker.STREAM_DATA_FIELD) continue;

				this.emit('message', new RedisMessage(this, streamId, entryId, this.deserialize(fields[1])));
			}
		}
	}

	private handleError(error: unknown) {
		this.emit('error', error);
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
	(value: RedisMessage.Data): Buffer;
}

export interface Deserializer {
	(value: Buffer): RedisMessage.Data;
}
