export function* reverse<T>(array: readonly T[]): IterableIterator<T> {
	for (let i = array.length - 1; i >= 0; i--) {
		yield array[i];
	}
}

export function* map<T, R>(iterator: IterableIterator<T>, cb: (value: T) => R): IterableIterator<R> {
	let result: IteratorResult<T> | null = null;
	while (!(result = iterator.next()).done) {
		yield cb(result.value);
	}
}
