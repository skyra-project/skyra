import { Sticker } from '../structures/Sticker';
import { HashScopedCache } from './base/HashScopeCache';

export class CacheStickers extends HashScopedCache<Sticker> {
	public readonly tail = ':stickers';
	public readonly structure = Sticker;
}
