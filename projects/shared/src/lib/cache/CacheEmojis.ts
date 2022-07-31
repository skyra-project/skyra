import { Emoji } from '../structures/Emoji';
import { HashScopedCache } from './base/HashScopedCache';

export class CacheEmojis extends HashScopedCache<Emoji> {
	public readonly tail = ':emojis';
	public readonly structure = Emoji;
}
