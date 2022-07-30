import { isNullish } from '@sapphire/utilities';
import { Reader } from '../../data/Reader';
import type { IStructure, IStructureConstructor } from '../../structures/interfaces/IStructure';
import { ScopedCache } from './ScopedCache';

export abstract class HashScopeCache<T extends IStructure> extends ScopedCache {
	public abstract readonly tail: string;
	public abstract readonly structure: IStructureConstructor<T>;

	public set(guildId: ScopedCache.Snowflake, entries: T | readonly T[]) {
		return Array.isArray(entries) ? this.setMany(guildId, entries as readonly T[]) : this.setOne(guildId, entries as T);
	}

	public async has(guildId: ScopedCache.Snowflake, entryId: ScopedCache.Snowflake) {
		const data = await this.client.hexists(this.makeGuildId(guildId), entryId.toString());
		return data === 1;
	}

	public async get(guildId: ScopedCache.Snowflake, entryId: ScopedCache.Snowflake): Promise<T | null>;
	public async get(guildId: ScopedCache.Snowflake, entries: readonly ScopedCache.Snowflake[]): Promise<Map<bigint, T>>;
	public async get(guildId: ScopedCache.Snowflake, entries: ScopedCache.Snowflake | readonly ScopedCache.Snowflake[]) {
		return Array.isArray(entries)
			? this.getMany(guildId, entries as readonly ScopedCache.Snowflake[])
			: this.getOne(guildId, entries as ScopedCache.Snowflake);
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

	protected override makeGuildId(guildId: ScopedCache.Snowflake) {
		return `${this.parent['prefix']}${guildId}${this.tail}`;
	}

	private async getOne(guildId: ScopedCache.Snowflake, entryId: ScopedCache.Snowflake) {
		const data = await this.client.hgetBuffer(this.makeGuildId(guildId), entryId.toString());
		return data ? this.structure.fromBinary(new Reader(data)) : null;
	}

	private async getMany(guildId: ScopedCache.Snowflake, entries: readonly ScopedCache.Snowflake[]) {
		const buffers = await this.client.hmgetBuffer(this.makeGuildId(guildId), ...entries.map((entry) => entry.toString()));

		const result = new Map<bigint, T>();
		for (const buffer of buffers) {
			if (isNullish(buffer)) continue;

			const channel = this.structure.fromBinary(new Reader(buffer));
			result.set(channel.id, channel);
		}

		return result;
	}

	private async setOne(guildId: ScopedCache.Snowflake, entry: T) {
		await this.client.hset(this.makeGuildId(guildId), entry.id.toString(), entry.toBuffer());
	}

	private async setMany(guildId: ScopedCache.Snowflake, entries: readonly T[]) {
		if (entries.length === 0) return;
		if (entries.length === 1) return this.setOne(guildId, entries[0]);
		await this.client.hmset(this.makeGuildId(guildId), ...entries.flatMap((entry) => [entry.id.toString(), entry.toBuffer()]));
	}
}
