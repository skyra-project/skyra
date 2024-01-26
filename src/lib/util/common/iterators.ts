export function first<T>(iterator: IterableIterator<T>): T | undefined {
	return iterator.next().value;
}

export function* map<T, R>(iterator: IterableIterator<T>, cb: (value: T) => R): IterableIterator<R> {
	let result: IteratorResult<T> | null = null;
	while (!(result = iterator.next()).done) {
		yield cb(result.value);
	}
}

export function* filter<T>(iterator: IterableIterator<T>, cb: (value: T) => boolean): IterableIterator<T> {
	let result: IteratorResult<T> | null = null;
	while (!(result = iterator.next()).done) {
		if (cb(result.value)) yield result.value;
	}
}
