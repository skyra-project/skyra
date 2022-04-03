export function iteratorRange<T>(iterator: IterableIterator<T>, position: number, offset: number) {
	let result: IteratorResult<T> | null = null;
	while (position-- > 0) {
		result = iterator.next();
		if (result.done) return [];
	}

	const results: T[] = [];
	while (offset-- > 0) {
		result = iterator.next();
		if (result.done) return results;
		results.push(result.value);
	}
	return results;
}

export function* map<T, R>(iterator: IterableIterator<T>, cb: (value: T) => R): IterableIterator<R> {
	let result: IteratorResult<T> | null = null;
	while (!(result = iterator.next()).done) {
		yield cb(result.value);
	}
}

export function skip<T>(iterator: IterableIterator<T>, times: number): IterableIterator<T> {
	if (times <= 0) return iterator;

	let result: IteratorResult<T> | null = null;
	let i = 0;

	do {
		result = iterator.next();
		++i;
	} while (i < times && !result.done);

	return iterator;
}

export function* filter<T>(iterator: IterableIterator<T>, cb: (value: T) => boolean): IterableIterator<T> {
	let result: IteratorResult<T> | null = null;
	while (!(result = iterator.next()).done) {
		if (cb(result.value)) yield result.value;
	}
}

export function* take<T>(iterator: IterableIterator<T>, amount: number): IterableIterator<T> {
	let i = 0;
	let result: IteratorResult<T> | null = null;
	while (i++ < amount && !(result = iterator.next()).done) {
		yield result.value;
	}
}
