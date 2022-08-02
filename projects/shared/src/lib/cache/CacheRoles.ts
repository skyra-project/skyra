import { Role } from './structures/Role.js';
import { HashScopedCache } from './base/HashScopedCache.js';

export class CacheRoles extends HashScopedCache<Role> {
	public readonly tail = ':roles';
	public readonly structure = Role;
}
