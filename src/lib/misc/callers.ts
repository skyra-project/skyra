const kUnSet = Symbol('skyra.lib.misc.promises.unset');

export function callOnce<T>(cb: () => T): () => T {
	let value: T | typeof kUnSet = kUnSet;

	return () => {
		if (value === kUnSet) value = cb();
		return value;
	};
}

export function callOnceAsync<T>(cb: () => Promise<T>): () => Promise<T> {
	let value: T | typeof kUnSet = kUnSet;

	return async () => {
		if (value === kUnSet) value = await cb();
		return value;
	};
}
