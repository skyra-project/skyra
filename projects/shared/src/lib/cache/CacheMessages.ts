import { Message } from '../structures/Message';
import { HashScopedCache } from './base/HashScopedCache';

export class CacheMessages extends HashScopedCache<Message> {
	public readonly tail = ':messages';
	public readonly structure = Message;
}
