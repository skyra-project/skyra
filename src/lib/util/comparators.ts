import { isNullish, Nullish } from '@sapphire/utilities';

export function isNullishOrZero(value: unknown): value is Nullish | 0 {
	return value === 0 || isNullish(value);
}

export function hasAtLeastOneKeyInMap<T>(map: ReadonlyMap<T, any>, keys: readonly T[]): boolean {
	return keys.some((key) => map.has(key));
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
