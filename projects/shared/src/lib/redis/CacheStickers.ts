import { Sticker } from '../structures/Sticker';
import { HashScopeCache } from './base/HashScopeCache';

export class CacheStickers extends HashScopeCache<Sticker> {
	public readonly tail = ':stickers';
	public readonly structure = Sticker;
}
