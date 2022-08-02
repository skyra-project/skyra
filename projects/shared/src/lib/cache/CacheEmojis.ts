import { Emoji } from './structures/Emoji.js';
import { HashScopedCache } from './base/HashScopedCache.js';

export class CacheEmojis extends HashScopedCache<Emoji> {
	public readonly tail = ':emojis';
	public readonly structure = Emoji;
}
