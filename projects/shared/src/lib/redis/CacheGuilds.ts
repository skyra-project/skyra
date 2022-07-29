import { count } from 'ix/asynciterable/count';
import { Reader } from '../data/Reader';
import { Guild } from '../structures/Guild';
import { ScopedCache } from './base/ScopedCache';

export class CacheGuilds extends ScopedCache {
	public async set(guild: Guild) {
		await this.client.set(this.makeGuildId(guild.id), guild.toBuffer());
	}

	public async has(guildId: ScopedCache.Snowflake) {
		const data = await this.client.exists(this.makeGuildId(guildId));
		return data === 1;
	}

	public async get(guildId: ScopedCache.Snowflake) {
		const data = await this.client.getBuffer(this.makeGuildId(guildId));
		return data ? Guild.fromBinary(new Reader(data)) : null;
	}

	public async getAll() {
		const result = new Map<bigint, Guild>();
		const stream = this.client.scanBufferStream({ match: this.makeGuildId('*'), count: 100 }) as AsyncIterable<Buffer>;
		for await (const data of stream) {
			const guild = Guild.fromBinary(new Reader(data));
			result.set(guild.id, guild);
		}

		return result;
	}

	public async remove(guildId: ScopedCache.Snowflake) {
		const key = this.makeGuildId(guildId);
		const result = await this.client.del(key, `${key}:channels`, `${key}:emojis`, `${key}:members`, `${key}:roles`, `${key}:stickers`);
		return result > 0;
	}

	public count() {
		return count(this.client.scanBufferStream({ match: this.makeGuildId('*'), count: 100 }));
	}
}
