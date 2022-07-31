import { isNullish, type Nullish } from '@sapphire/utilities';

export function normalizeNullable<Value, Return>(value: Value | Nullish, cb: (value: Value) => Return): Return | null {
	return isNullish(value) ? null : cb(value);
}

export function normalizeOptional<Value, Return>(value: Value | Nullish, cb: (value: Value) => Return): Return | undefined {
	return isNullish(value) ? undefined : cb(value);
}

export function normalizeArray<Value, Return>(values: readonly Value[] | Nullish, cb: (value: Value) => Return): Return[] | null {
	return isNullish(values) ? null : values.map((value) => cb(value));
}

export function toTimestamp(value: string | number): number;
export function toTimestamp(value: string | number | Nullish): number | null;
export function toTimestamp(value: string | number | Nullish): number | null {
	switch (typeof value) {
		case 'number':
			return value;
		case 'string':
			return Date.parse(value);
		case 'bigint':
			return Number(value);
		default:
			return null;
	}
}

export function fromTimestamp(value: number): string;
export function fromTimestamp(value: number | Nullish): string | null;
export function fromTimestamp(value: number | Nullish): string | null {
	return typeof value === 'number' ? new Date(value).toISOString() : null;
}
