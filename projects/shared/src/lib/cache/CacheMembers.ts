import { Member } from './structures/Member.js';
import { HashScopedCache } from './base/HashScopedCache.js';

export class CacheMembers extends HashScopedCache<Member> {
	public readonly tail = ':members';
	public readonly structure = Member;
}
