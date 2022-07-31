import { Emoji } from '../structures/Emoji';
import { HashScopedCache } from './base/HashScopeCache';

export class CacheEmojis extends HashScopedCache<Emoji> {
	public readonly tail = ':emojis';
	public readonly structure = Emoji;
}
