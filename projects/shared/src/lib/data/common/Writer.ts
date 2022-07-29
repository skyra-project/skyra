import { isNullish, isNullishOrEmpty, type NonNullObject, type Nullish } from '@sapphire/utilities';

const encoder = new TextEncoder();

export class Writer {
	private data: Buffer;
	private offset = 0;

	public constructor(size: number) {
		this.data = Buffer.alloc(size);
	}

	public get raw() {
		return this.data;
	}

	public get trimmed() {
		return this.data.subarray(0, this.offset);
	}

	public bool(value: boolean | Nullish) {
		if (isNullish(value)) return this.writeNull();

		this.ensure(2);
		this.offset += this.data.writeUInt8(1, this.offset);
		this.offset += this.data.writeInt8(value ? 1 : 0, this.offset);

		return this;
	}

	public i8(value: number | Nullish) {
		if (isNullish(value)) return this.writeNull();

		this.ensure(2);
		this.offset += this.data.writeUInt8(1, this.offset);
		this.offset += this.data.writeInt8(value, this.offset);

		return this;
	}

	public u8(value: number | Nullish) {
		if (isNullish(value)) return this.writeNull();

		this.ensure(2);
		this.offset += this.data.writeUInt8(1, this.offset);
		this.offset += this.data.writeUInt8(value, this.offset);

		return this;
	}

	public u16(value: number | Nullish) {
		if (isNullish(value)) return this.writeNull();

		this.ensure(5);
		this.offset += this.data.writeUInt8(1, this.offset);
		this.offset += this.data.writeUInt16LE(value, this.offset);

		return this;
	}

	public i32(value: number | Nullish) {
		if (isNullish(value)) return this.writeNull();

		this.ensure(5);
		this.offset += this.data.writeUInt8(1, this.offset);
		this.offset += this.data.writeInt32LE(value, this.offset);

		return this;
	}

	public u32(value: number | Nullish) {
		if (isNullish(value)) return this.writeNull();

		this.ensure(5);
		this.offset += this.data.writeUInt8(1, this.offset);
		this.offset += this.data.writeUInt32LE(value, this.offset);

		return this;
	}

	public u64(value: string | number | bigint | Nullish) {
		if (isNullish(value)) return this.writeNull();

		this.ensure(9);
		this.offset += this.data.writeUInt8(1, this.offset);
		this.offset += this.data.writeBigUInt64LE(BigInt(value), this.offset);

		return this;
	}

	public string(value: string | Nullish) {
		if (isNullishOrEmpty(value)) return this.writeNull();

		const data = encoder.encode(value);

		// Ensure length + characters
		this.ensure(4 + data.byteLength);
		this.offset += this.data.writeUInt32LE(data.byteLength, this.offset);
		this.data.set(data, this.offset);
		this.offset += data.byteLength;

		return this;
	}

	public date(value: string | number | Nullish) {
		if (typeof value === 'string') value = Date.parse(value);
		return this.u64(value);
	}

	public array<T>(values: readonly T[] | Nullish, cb: (buffer: this, value: T) => void) {
		if (isNullishOrEmpty(values)) return this.writeNull();

		this.ensure(4);
		this.offset += this.data.writeUInt32LE(values.length, this.offset);
		for (const value of values) {
			cb(this, value);
		}

		return this;
	}

	public object<T extends NonNullObject>(value: T | Nullish, cb: (buffer: this, value: T) => void) {
		if (isNullish(value)) return this.writeNull();

		this.ensure(1);
		this.offset += this.data.writeUInt8(1, this.offset);
		cb(this, value);

		return this;
	}

	private writeNull() {
		this.ensure(1);
		this.offset += this.data.writeUInt8(0, this.offset);

		return this;
	}

	private ensure(bytes: number) {
		const nextOffset = this.offset + bytes;
		if (nextOffset < this.data.byteLength) return;

		const data = Buffer.alloc(Math.max(nextOffset, this.data.byteLength * 2));
		data.set(this.data, 0);
		this.data = data;
	}
}
