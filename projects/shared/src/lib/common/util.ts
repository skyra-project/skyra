import { isNullish, type Nullish } from '@sapphire/utilities';

export function arrayEquals<T>(a: readonly T[], b: readonly T[]): boolean {
	return a.length === b.length && a.every((value, index) => b[index] === value);
}

export function isDefined<Value>(value: Value): value is Exclude<Value, undefined> {
	return value !== undefined;
}

export function defaultOptional<Value>(value: Value | undefined, fallback: Value): Value;
export function defaultOptional<Value, Return>(value: Value | undefined, fallback: Return, cb: (value: Value) => Return): Return;
export function defaultOptional<Value, Return>(value: Value | undefined, fallback: Return, cb?: (value: Value) => Return): Value | Return {
	return value === undefined ? fallback : typeof cb === 'function' ? cb(value) : value;
}

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
