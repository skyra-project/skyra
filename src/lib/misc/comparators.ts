export type Nullish = null | undefined;

export function isNullish(value: unknown): value is Nullish {
	return value === null || value === undefined;
}

export function isNullishOrZero(value: unknown): value is Nullish | 0 {
	return value === 0 || isNullish(value);
}

export function hasAtLeastOneKeyInMap<T>(map: ReadonlyMap<T, any>, keys: readonly T[]): boolean {
	return keys.some((key) => map.has(key));
}
