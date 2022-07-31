import { Sticker } from '../structures/Sticker';
import { HashScopedCache } from './base/HashScopedCache';

export class CacheStickers extends HashScopedCache<Sticker> {
	public readonly tail = ':stickers';
	public readonly structure = Sticker;
}
