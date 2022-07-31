import type { MessageBroker } from './MessageBroker';

export class RedisMessage {
	public readonly streamIdBuffer: Buffer;
	public readonly entryIdBuffer: Buffer;
	public readonly data: unknown;
	private readonly broker: MessageBroker;

	public constructor(broker: MessageBroker, streamId: Buffer, entryId: Buffer, data: unknown) {
		this.broker = broker;
		this.streamIdBuffer = streamId;
		this.entryIdBuffer = entryId;
		this.data = data;
	}

	public get streamId(): string {
		return this.streamIdBuffer.toString('utf8');
	}

	public get entryId(): string {
		return this.entryIdBuffer.toString('utf8');
	}

	public async ack() {
		const value = await this.broker.redis.xack(this.streamIdBuffer, this.broker.stream, this.entryIdBuffer);
		return value > 0;
	}
}
