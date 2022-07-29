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

	public async remove(guildId: ScopedCache.Snowflake) {
		const key = this.makeGuildId(guildId);
		const result = await this.client.del(key, `${key}:channels`, `${key}:members`, `${key}:roles`, `${key}:stickers`);
		return result > 0;
	}
}
