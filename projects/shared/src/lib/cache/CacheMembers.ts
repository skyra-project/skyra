import { Member } from '../structures/Member';
import { HashScopedCache } from './base/HashScopeCache';

export class CacheMembers extends HashScopedCache<Member> {
	public readonly tail = ':members';
	public readonly structure = Member;
}
