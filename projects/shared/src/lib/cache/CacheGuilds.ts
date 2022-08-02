import { Collection } from '@discordjs/collection';
import { isNullish } from '@sapphire/utilities';
import { count } from 'ix/asynciterable/count.js';
import { Reader } from '../data/Reader.js';
import { ScopedCache } from './base/ScopedCache.js';
import { Guild } from './structures/Guild.js';

export class CacheGuilds extends ScopedCache {
	public async set(guild: Guild) {
		await this.client.set(this.makeId(guild.id), guild.toBuffer());
	}

	public async has(guildId: ScopedCache.Snowflake) {
		const data = await this.client.exists(this.makeId(guildId));
		return data === 1;
	}

	public async get(guildId: ScopedCache.Snowflake) {
		const data = await this.client.getBuffer(this.makeId(guildId));
		return data ? Guild.fromBinary(new Reader(data)) : null;
	}

	public async getAll() {
		const result = new Collection<bigint, Guild>();
		for await (const guild of this.values()) {
			result.set(guild.id, guild);
		}

		return result;
	}

	public count() {
		return count(this.client.scanBufferStream({ match: this.makeId('*'), count: 100 }));
	}

	public async remove(guildId: ScopedCache.Snowflake) {
		const key = this.makeId(guildId);
		const result = await this.client.del(key, `${key}:channels`, `${key}:emojis`, `${key}:members`, `${key}:roles`, `${key}:stickers`);
		return result > 0;
	}

	public async *keys(): AsyncIterable<bigint> {
		// eslint-disable-next-line @typescript-eslint/dot-notation
		const offset = this.parent['prefix'].length;
		for await (const id of this.client.scanStream({ match: this.makeId('*'), count: 100 }) as AsyncIterable<string>) {
			yield BigInt(id.slice(offset));
		}
	}

	public async *values(): AsyncIterable<Guild> {
		const match = this.makeId('*');
		const count = 100;

		let cursor = '0';
		do {
			const [next, keys] = await this.client.scanBuffer(cursor, 'MATCH', match, 'COUNT', count);
			const buffers = await this.client.mgetBuffer(...keys);
			for (const buffer of buffers) {
				if (isNullish(buffer)) continue;
				yield Guild.fromBinary(new Reader(buffer));
			}

			cursor = next.toString();
		} while (cursor !== '0');
	}

	public async *entries(): AsyncIterable<[id: bigint, value: Guild]> {
		for await (const value of this.values()) {
			yield [value.id, value];
		}
	}
}
