import { Role } from '../structures/Role';
import { HashScopeCache } from './base/HashScopeCache';

export class CacheRoles extends HashScopeCache<Role> {
	public readonly tail: ':roles';
	public readonly structure = Role;
}
