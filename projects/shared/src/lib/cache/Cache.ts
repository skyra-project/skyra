import { isNullishOrEmpty, type Nullish } from '@sapphire/utilities';
import type { Redis } from 'ioredis';
import { CacheChannels } from './CacheChannels.js';
import { CacheEmojis } from './CacheEmojis.js';
import { CacheGuilds } from './CacheGuilds.js';
import { CacheMembers } from './CacheMembers.js';
import { CacheMessages } from './CacheMessages.js';
import { CacheRoles } from './CacheRoles.js';
import { CacheStickers } from './CacheStickers.js';

export class Cache {
	public readonly client: Redis;
	public readonly channels: CacheChannels;
	public readonly emojis: CacheEmojis;
	public readonly guilds: CacheGuilds;
	public readonly members: CacheMembers;
	public readonly messages: CacheMessages;
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
		this.messages = new CacheMessages(this);
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
