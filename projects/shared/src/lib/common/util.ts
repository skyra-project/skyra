import { isNullish, type Nullish } from '@sapphire/utilities';

export function normalize<Value, Return>(value: Value | Nullish, cb: (value: Value) => Return): Return | null {
	return isNullish(value) ? null : cb(value);
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
