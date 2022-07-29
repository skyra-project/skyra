import { Channel } from '../structures/Channel';
import { HashScopeCache } from './base/HashScopeCache';

export class CacheChannels extends HashScopeCache<Channel> {
	public readonly tail: ':channels';
	public readonly structure = Channel;
}
