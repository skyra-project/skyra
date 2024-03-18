import { asc } from '#utils/common';
import { isFunction } from '@sapphire/utilities';

/**
 * Represents a collection of key-value pairs that are sorted by the key.
 */
export class SortedCollection<K extends number | string | bigint, V> implements Map<K, V> {
	/**
	 * The entries of this collection.
	 */
	readonly #entries: [K, V][] = [];

	/**
	 * The comparator function used to sort the collection.
	 */
	readonly #comparator: (a: K, b: K) => number;

	public constructor(data?: Iterable<[K, V]>, comparator: (a: K, b: K) => number = asc) {
		this.#comparator = comparator;

		if (data) {
			this.#entries.push(...data);
			this.#entries.sort(([aKey], [bKey]) => this.#comparator(aKey, bKey));
		}
	}

	/**
	 * Gets the number of entries in the collection.
	 */
	public get size() {
		return this.#entries.length;
	}

	/**
	 * Sets the value for the specified key in the collection.
	 * If the key already exists, the value will be updated.
	 * If the key does not exist, a new entry will be added to the collection.
	 *
	 * @param key - The key to set the value for.
	 * @param value - The value to set.
	 * @returns The SortedCollection instance.
	 */
	public set(key: K, value: V) {
		let left = 0;
		let right = this.#entries.length - 1;

		while (left <= right) {
			const mid = (left + right) >> 1;
			const midKey = this.#entries[mid][0];
			const cmp = this.#comparator(midKey, key);
			if (cmp === 0) {
				this.#entries[mid][1] = value;
				return this;
			}

			if (cmp < 0) left = mid + 1;
			else right = mid - 1;
		}

		this.#entries.splice(left, 0, [key, value]);
		return this;
	}

	/**
	 * Checks if the collection contains a specific key.
	 *
	 * @param key - The key to check for.
	 * @returns `true` if the collection contains the key, `false` otherwise.
	 */
	public has(key: K): boolean {
		return this.indexOf(key) !== -1;
	}

	/**
	 * Retrieves the value associated with the specified key.
	 *
	 * @param key - The key to retrieve the value for.
	 * @returns The value associated with the key, or `undefined` if the key is not found.
	 */
	public get(key: K): V | undefined {
		const index = this.indexOf(key);
		return index === -1 ? undefined : this.#entries[index][1];
	}

	/**
	 * Returns the index of the specified key in the sorted collection.
	 * If the key is not found, it returns -1.
	 *
	 * @param key - The key to search for in the collection.
	 * @returns The index of the key, or -1 if the key is not found.
	 */
	public indexOf(key: K) {
		let left = 0;
		let right = this.#entries.length - 1;
		while (left <= right) {
			const mid = (left + right) >> 1;
			const midKey = this.#entries[mid][0];
			const cmp = this.#comparator(midKey, key);
			if (cmp === 0) return mid;

			if (cmp < 0) left = mid + 1;
			else right = mid - 1;
		}

		return -1;
	}

	/**
	 * Deletes an entry from the collection based on the specified key.
	 *
	 * @param key The key of the entry to delete.
	 * @returns `true` if the entry was successfully deleted, `false` otherwise.
	 */
	public delete(key: K) {
		const index = this.indexOf(key);
		if (index === -1) return false;

		this.#entries.splice(index, 1);
		return true;
	}

	/**
	 * Clears all entries from the collection.
	 */
	public clear(): void {
		this.#entries.splice(0, this.#entries.length);
	}

	/**
	 * Identical to
	 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter | Array.filter()},
	 * but returns a Collection instead of an Array.
	 *
	 * @param fn - The function to test with (should return boolean)
	 * @param thisArg - Value to use as `this` when executing function
	 * @example
	 * ```ts
	 * collection.filter(user => user.username === 'Bob');
	 * ```
	 */
	public filter<K2 extends K>(fn: (value: V, key: K, collection: this) => key is K2): SortedCollection<K2, V>;
	public filter<V2 extends V>(fn: (value: V, key: K, collection: this) => value is V2): SortedCollection<K, V2>;
	public filter(fn: (value: V, key: K, collection: this) => unknown): SortedCollection<K, V>;
	public filter<This, K2 extends K>(fn: (this: This, value: V, key: K, collection: this) => key is K2, thisArg: This): SortedCollection<K2, V>;
	public filter<This, V2 extends V>(fn: (this: This, value: V, key: K, collection: this) => value is V2, thisArg: This): SortedCollection<K, V2>;
	public filter<This>(fn: (this: This, value: V, key: K, collection: this) => unknown, thisArg: This): SortedCollection<K, V>;
	public filter(fn: (value: V, key: K, collection: this) => unknown, thisArg?: unknown): SortedCollection<K, V> {
		if (!isFunction(fn)) throw new TypeError(`${fn} is not a function`);
		if (thisArg !== undefined) fn = fn.bind(thisArg);

		const results = new SortedCollection<K, V>(undefined, this.#comparator);
		for (const entry of this.#entries) {
			if (fn(entry[1], entry[0], this)) results.#entries.push(entry);
		}

		return results;
	}

	/**
	 * Removes items that satisfy the provided filter function.
	 *
	 * @param fn - Function used to test (should return a boolean)
	 * @param thisArg - Value to use as `this` when executing function
	 * @returns The number of removed entries
	 */
	public sweep(fn: (value: V, key: K, collection: this) => unknown): number;
	public sweep<T>(fn: (this: T, value: V, key: K, collection: this) => unknown, thisArg: T): number;
	public sweep(fn: (value: V, key: K, collection: this) => unknown, thisArg?: unknown): number {
		if (!isFunction(fn)) throw new TypeError(`${fn} is not a function`);
		if (thisArg !== undefined) fn = fn.bind(thisArg);

		const previousSize = this.size;
		let i = 0;
		while (i < this.#entries.length) {
			const [key, value] = this.#entries[i];
			if (fn(value, key, this)) this.#entries.splice(i, 1);
			else i++;
		}

		return previousSize - this.size;
	}

	public forEach(fn: (value: V, key: K, map: this) => void, thisArg?: unknown): void {
		if (!isFunction(fn)) throw new TypeError(`${fn} is not a function`);
		if (thisArg !== undefined) fn = fn.bind(thisArg);

		for (const [key, value] of this.#entries) {
			fn(value, key, this);
		}
	}

	/**
	 * Returns an iterator that contains all the keys in the collection.
	 */
	public *keys() {
		for (const [key] of this.#entries) {
			yield key;
		}
	}

	/**
	 * Returns an iterator that yields all the values in the collection.
	 */
	public *values() {
		for (const [, value] of this.#entries) {
			yield value;
		}
	}

	/**
	 * Returns an iterator that yields all the entries in the collection.
	 */
	public *entries() {
		yield* this.#entries;
	}

	/**
	 * Returns an iterator that yields all the entries in the collection.
	 */
	public *[Symbol.iterator](): IterableIterator<[K, V]> {
		yield* this.#entries;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get [Symbol.toStringTag](): string {
		return 'SortedCollection';
	}
}
