export function iteratorAt<T>(iterator: IterableIterator<T>, position: number): T | null {
	if (position < 0) return null;

	let result: IteratorResult<T> | null = null;
	while (position-- > 0) {
		result = iterator.next();
		if (result.done) return null;
	}

	result = iterator.next();
	return result.done ? null : result.value;
}

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

export function* reverse<T>(array: readonly T[]): IterableIterator<T> {
	for (let i = array.length - 1; i >= 0; i--) {
		yield array[i];
	}
}

export function* empty<T>(): IterableIterator<T> {
	// noop
}

export function count<T>(iterator: IterableIterator<T>, cb: (value: T) => boolean): number {
	let n = 0;
	for (const value of iterator) {
		if (cb(value)) ++n;
	}

	return n;
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

export function reduce<T, R>(iterator: IterableIterator<T>, cb: (previous: R, value: T) => R, first: R): R {
	let output = first;
	let result: IteratorResult<T> | null = null;
	while (!(result = iterator.next()).done) {
		output = cb(output, result.value);
	}

	return output;
}

export function* take<T>(iterator: IterableIterator<T>, amount: number): IterableIterator<T> {
	let i = 0;
	let result: IteratorResult<T> | null = null;
	while (i++ < amount && !(result = iterator.next()).done) {
		yield result.value;
	}
}

export function first<T>(iterator: IterableIterator<T>): T | null {
	const result = iterator.next();
	return result.done ? null : result.value;
}

export function* prepend<T>(iterator: IterableIterator<T>, value: T): IterableIterator<T> {
	yield value;
	yield* iterator;
}

export function* prependIfNotNull<T>(iterator: IterableIterator<T>, value: T | null): IterableIterator<T> {
	if (value !== null) yield value;
	yield* iterator;
}
