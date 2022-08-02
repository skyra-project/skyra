import { Message } from './structures/Message.js';
import { HashScopedCache } from './base/HashScopedCache.js';

export class CacheMessages extends HashScopedCache<Message> {
	public readonly tail = ':messages';
	public readonly structure = Message;
}
