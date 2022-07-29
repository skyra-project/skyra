import { NonNullObject } from '@sapphire/utilities';

const decoder = new TextDecoder();

export class Reader {
	private data: Buffer;
	private offset = 0;

	public constructor(data: Buffer) {
		this.data = data;
	}

	public bool(): boolean | null {
		if (this.readNull()) return null;
		return this.data.readUInt8(this.offset++) === 1;
	}

	public i8(): number | null {
		if (this.readNull()) return null;
		return this.data.readInt8(this.offset++);
	}

	public u8(): number | null {
		if (this.readNull()) return null;
		return this.data.readUInt8(this.offset++);
	}

	public u16(): number | null {
		if (this.readNull()) return null;
		const value = this.data.readUInt16LE(this.offset);
		this.offset += 2;
		return value;
	}

	public i32(): number | null {
		if (this.readNull()) return null;
		const value = this.data.readInt32LE(this.offset);
		this.offset += 4;
		return value;
	}

	public u32(): number | null {
		if (this.readNull()) return null;
		const value = this.data.readUInt32LE(this.offset);
		this.offset += 4;
		return value;
	}

	public u64(): bigint | null {
		if (this.readNull()) return null;
		const value = this.data.readBigUInt64LE(this.offset);
		this.offset += 8;
		return value;
	}

	public string(): string | null {
		if (this.readNull()) return null;

		const length = this.data.readUInt32LE(this.offset);
		this.offset += 4;

		const string = decoder.decode(this.data.subarray(this.offset, this.offset + length));
		this.offset += length;
		return string;
	}

	public date(): number | null {
		if (this.readNull()) return null;
		const value = this.data.readBigUInt64LE(this.offset);
		this.offset += 8;
		return Number(value);
	}

	public array<T>(cb: (buffer: this) => T): T[] {
		if (this.readNull()) return [];

		const length = this.data.readUInt32LE(this.offset);
		this.offset += 4;

		const values: T[] = [];
		for (let i = 0; i < length; i++) {
			values.push(cb(this));
		}

		return values;
	}

	public object<T extends NonNullObject>(cb: (buffer: this) => T): T | null {
		if (this.readNull()) return null;

		return cb(this);
	}

	private readNull() {
		return this.data.readUInt8(this.offset++);
	}
}
