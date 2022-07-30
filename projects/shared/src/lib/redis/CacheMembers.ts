import { Member } from '../structures/Member';
import { HashScopeCache } from './base/HashScopeCache';

export class CacheMembers extends HashScopeCache<Member> {
	public readonly tail = ':members';
	public readonly structure = Member;
}
