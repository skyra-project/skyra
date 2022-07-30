import { isNullishOrEmpty, type Nullish } from '@sapphire/utilities';
import type { Redis } from 'ioredis';
import { CacheChannels } from './CacheChannels';
import { CacheEmojis } from './CacheEmojis';
import { CacheGuilds } from './CacheGuilds';
import { CacheMembers } from './CacheMembers';
import { CacheRoles } from './CacheRoles';
import { CacheStickers } from './CacheStickers';

export class Cache {
	public readonly client: Redis;
	public readonly channels: CacheChannels;
	public readonly emojis: CacheEmojis;
	public readonly guilds: CacheGuilds;
	public readonly members: CacheMembers;
	public readonly roles: CacheRoles;
	public readonly stickers: CacheStickers;
	protected readonly prefix: string;

	public constructor(options: Cache.Options) {
		this.client = options.client;
		this.prefix = isNullishOrEmpty(options.prefix) ? '' : `${options.prefix}:`;

		this.channels = new CacheChannels(this);
		this.emojis = new CacheEmojis(this);
		this.guilds = new CacheGuilds(this);
		this.members = new CacheMembers(this);
		this.roles = new CacheRoles(this);
		this.stickers = new CacheStickers(this);
	}
}

export namespace Cache {
	export interface Options {
		client: Redis;
		prefix?: string | Nullish;
	}
}
