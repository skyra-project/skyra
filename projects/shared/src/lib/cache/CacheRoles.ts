import { Role } from '../structures/Role';
import { HashScopedCache } from './base/HashScopedCache';

export class CacheRoles extends HashScopedCache<Role> {
	public readonly tail = ':roles';
	public readonly structure = Role;
}
