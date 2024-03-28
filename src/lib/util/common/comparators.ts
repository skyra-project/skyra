export function asc(a: number | string | bigint, b: number | string | bigint): -1 | 0 | 1 {
	return a < b ? -1 : a > b ? 1 : 0;
}

export function desc(a: number | string | bigint, b: number | string | bigint): -1 | 0 | 1 {
	return a > b ? -1 : a < b ? 1 : 0;
}

/**
 * Gets the maximum value.
 * @param values The values to compare.
 * @returns The maximum value.
 */
export function max<N extends number | bigint>(...values: readonly N[]): N {
	if (values.length === 0) throw new TypeError('Expected at least 1 value.');

	let lowest = values[0];
	for (let i = 1; i < values.length; ++i) {
		const value = values[i];
		if (value > lowest) lowest = value;
	}

	return lowest;
}

export function differenceBitField<T extends number | bigint>(previous: T, next: T) {
	const diff = (previous ^ next) as T;
	const added = (next & diff) as T;
	const removed = (previous & diff) as T;
	return { added, removed };
}

export function differenceArray<T>(previous: readonly T[], next: readonly T[]) {
	const added = next.filter((value) => !previous.includes(value));
	const removed = previous.filter((value) => !next.includes(value));

	return { added, removed };
}

export function differenceMap<K, V>(previous: ReadonlyMap<K, V>, next: ReadonlyMap<K, V>) {
	const added = new Map<K, V>();
	const removed = new Map<K, V>();
	const updated = new Map<K, [previous: V, next: V]>();

	for (const [key, value] of previous.entries()) {
		const other = next.get(key);
		if (other === undefined) {
			removed.set(key, value);
		} else if (other !== value) {
			updated.set(key, [value, other]);
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

export type BooleanFn<ArgumentTypes extends readonly unknown[], ReturnType extends boolean = boolean> = (...args: ArgumentTypes) => ReturnType;

export function andMix<T extends readonly unknown[], R extends boolean>(...fns: readonly BooleanFn<T, R>[]): BooleanFn<T, R> {
	if (fns.length === 0) throw new Error('You must input at least one function.');
	return (...args) => {
		let ret!: R;
		for (const fn of fns) {
			if (!(ret = fn(...args))) break;
		}

		return ret;
	};
}

export function orMix<ArgumentTypes extends readonly unknown[], ReturnType extends boolean>(
	...fns: readonly BooleanFn<ArgumentTypes, ReturnType>[]
): BooleanFn<ArgumentTypes, ReturnType> {
	if (fns.length === 0) throw new Error('You must input at least one function.');
	return (...args) => {
		let ret!: ReturnType;
		for (const fn of fns) {
			if ((ret = fn(...args))) break;
		}

		return ret;
	};
}
