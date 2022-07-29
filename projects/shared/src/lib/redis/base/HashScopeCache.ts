import { Reader } from '../../data/Reader';
import { IStructure, IStructureConstructor } from '../../structures/interfaces/IStructure';
import { ScopedCache } from './ScopedCache';

export abstract class HashScopeCache<T extends IStructure> extends ScopedCache {
	public abstract readonly tail: string;
	public abstract readonly structure: IStructureConstructor<T>;

	public async set(guildId: ScopedCache.Snowflake, entry: T) {
		await this.client.hset(this.makeGuildId(guildId), entry.id.toString(), entry.toBuffer());
	}

	public async has(guildId: ScopedCache.Snowflake, entryId: ScopedCache.Snowflake) {
		const data = await this.client.hexists(this.makeGuildId(guildId), entryId.toString());
		return data === 1;
	}

	public async get(guildId: ScopedCache.Snowflake, entryId: ScopedCache.Snowflake) {
		const data = await this.client.hgetBuffer(this.makeGuildId(guildId), entryId.toString());
		return data ? this.structure.fromBinary(new Reader(data)) : null;
	}

	public async getAll(guildId: ScopedCache.Snowflake) {
		const buffers = await this.client.hvalsBuffer(this.makeGuildId(guildId));

		const result = new Map<bigint, T>();
		for (const buffer of buffers) {
			const channel = this.structure.fromBinary(new Reader(buffer));
			result.set(channel.id, channel);
		}

		return result;
	}

	public async remove(guildId: ScopedCache.Snowflake, entryId: ScopedCache.Snowflake) {
		const result = await this.client.hdel(this.makeGuildId(guildId), entryId.toString());
		return result > 0;
	}

	public count(guildId: ScopedCache.Snowflake) {
		return this.client.hlen(this.makeGuildId(guildId));
	}

	protected makeGuildId(guildId: ScopedCache.Snowflake) {
		return `${this.parent['prefix']}${guildId}${this.tail}`;
	}
}
