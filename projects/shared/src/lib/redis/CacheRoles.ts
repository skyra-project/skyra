import { Role } from '../structures/Role';
import { HashScopedCache } from './base/HashScopeCache';

export class CacheRoles extends HashScopedCache<Role> {
	public readonly tail = ':roles';
	public readonly structure = Role;
}
