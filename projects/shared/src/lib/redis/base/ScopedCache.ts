import type { Cache } from '../Cache';

export abstract class ScopedCache {
	public readonly parent: Cache;

	public constructor(parent: Cache) {
		this.parent = parent;
	}

	protected get client() {
		return this.parent.client;
	}

	protected makeGuildId(guildId: ScopedCache.Snowflake) {
		return `${this.parent['prefix']}${guildId}`;
	}
}

export namespace ScopedCache {
	export type Snowflake = bigint | string;
}
