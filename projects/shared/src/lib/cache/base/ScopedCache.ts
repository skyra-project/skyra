import type { Cache } from '../Cache.js';

export abstract class ScopedCache {
	public readonly parent: Cache;

	public constructor(parent: Cache) {
		this.parent = parent;
	}

	protected get client() {
		return this.parent.client;
	}

	protected makeId(parentId: ScopedCache.Snowflake) {
		// eslint-disable-next-line @typescript-eslint/dot-notation
		return `${this.parent['prefix']}${parentId}`;
	}
}

export namespace ScopedCache {
	export type Snowflake = bigint | string;
}
