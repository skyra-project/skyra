import { isNullish, Nullish } from '@sapphire/utilities';

export function isNullishOrZero(value: unknown): value is Nullish | 0 {
	return value === 0 || isNullish(value);
}

export function isNullishOrEmpty(value: unknown): value is Nullish | '' {
	return value === '' || isNullish(value);
}

export function hasAtLeastOneKeyInMap<T>(map: ReadonlyMap<T, any>, keys: readonly T[]): boolean {
	return keys.some((key) => map.has(key));
}

export function difference<K, V>(previous: ReadonlyMap<K, V>, next: ReadonlyMap<K, V>) {
	const added = new Map<K, V>();
	const updated = new Map<K, V>();
	const removed = new Map<K, V>();

	for (const [key, value] of previous.entries()) {
		const other = next.get(key);
		if (other === undefined) {
			removed.set(key, value);
		} else if (other !== value) {
			updated.set(key, value);
		}
	}

	for (const [key, value] of next.entries()) {
		const other = previous.get(key);
		if (other === undefined) {
			added.set(key, value);
		}
	}

	return { added, updated, removed };
}

export interface BidirectionalReplaceOptions<T> {
	onMatch(match: RegExpExecArray): T;
	outMatch(content: string, previous: number, next: number): T;
}

export function bidirectionalReplace<T>(regex: RegExp, content: string, options: BidirectionalReplaceOptions<T>) {
	const results: T[] = [];
	let previous = 0;
	let match: RegExpExecArray | null = null;

	while ((match = regex.exec(content)) !== null) {
		if (previous !== match.index) {
			results.push(options.outMatch(content.slice(previous, match.index), previous, match.index));
		}

		previous = regex.lastIndex;
		results.push(options.onMatch(match));
	}

	if (previous < content.length) results.push(options.outMatch(content.slice(previous), previous, content.length));
	return results;
}
