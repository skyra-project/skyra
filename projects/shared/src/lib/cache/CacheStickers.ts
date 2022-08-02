import { Sticker } from './structures/Sticker.js';
import { HashScopedCache } from './base/HashScopedCache.js';

export class CacheStickers extends HashScopedCache<Sticker> {
	public readonly tail = ':stickers';
	public readonly structure = Sticker;
}
