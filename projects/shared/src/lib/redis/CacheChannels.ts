import { Channel } from '../structures/Channel';
import { HashScopedCache } from './base/HashScopeCache';

export class CacheChannels extends HashScopedCache<Channel> {
	public readonly tail = ':channels';
	public readonly structure = Channel;
}
