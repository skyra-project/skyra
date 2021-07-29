export function differenceBitField(previous: number, next: number) {
	const diff = previous ^ next;
	const added = next & diff;
	const removed = previous & diff;
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

export type BooleanFn<T extends readonly unknown[], R extends boolean = boolean> = (...args: T) => R;

export function andMix<T extends readonly unknown[], R extends boolean>(fns: readonly BooleanFn<T, R>[]): BooleanFn<T, R> {
	if (fns.length === 0) throw new Error('You must input at least one function.');
	return (...args) => {
		let ret!: R;
		for (const fn of fns) {
			if (!(ret = fn(...args))) break;
		}

		return ret;
	};
}
