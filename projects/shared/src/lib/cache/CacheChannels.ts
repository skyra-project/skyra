import { Channel } from './structures/Channel.js';
import { HashScopedCache } from './base/HashScopedCache.js';

export class CacheChannels extends HashScopedCache<Channel> {
	public readonly tail = ':channels';
	public readonly structure = Channel;
}
