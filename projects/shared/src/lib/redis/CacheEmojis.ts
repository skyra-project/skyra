import { Emoji } from '../structures/Emoji';
import { HashScopeCache } from './base/HashScopeCache';

export class CacheEmojis extends HashScopeCache<Emoji> {
	public readonly tail: ':emojis';
	public readonly structure = Emoji;
}
