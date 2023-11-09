export function omit<T extends object, K extends keyof T>(object: T, ...keys: readonly K[]): Omit<T, K> {
	const clone = { ...object };
	for (const key of keys) delete clone[key];
	return clone;
}
