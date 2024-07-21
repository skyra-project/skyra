import type { StickyRole } from '#lib/database/entities';
import { readSettings, writeSettings } from '#lib/database/settings';
import { isNullish } from '@sapphire/utilities';
import type { Guild } from 'discord.js';

export interface StickyRoleManagerExtraContext {
	author: string;
}

export class StickyRoleManager {
	#guild: Guild;

	public constructor(guild: Guild) {
		this.#guild = guild;
	}

	public async get(userId: string): Promise<readonly string[]> {
		const settings = await readSettings(this.#guild);
		return settings.stickyRoles.find((entry) => entry.user === userId)?.roles ?? [];
	}

	public async has(userId: string, roleId: string): Promise<boolean> {
		const roles = await this.get(userId);
		return roles.includes(roleId);
	}

	public async fetch(userId: string): Promise<readonly string[]> {
		// 1.0. If the entry does not exist, return empty array
		const settings = await readSettings(this.#guild);
		const entry = settings.stickyRoles.find((entry) => entry.user === userId);
		if (isNullish(entry)) return [];

		// 2.0. Read the entry and clean the roles:
		const roles = [...this.cleanRoles(entry.roles)];

		// 2.1. If the roles are unchanged (have the same size), return them:
		if (entry.roles.length === roles.length) return entry.roles;

		// 2.2. If the roles are changed and leds to an empty array:
		if (roles.length === 0) {
			// 3.0.a. Then delete the entry from the settings:
			await this.clear(userId);
			return roles;
		}

		// 3.0.b. Make a clone with the userId and the fixed roles array:
		return writeSettings(this.#guild, (settings) => {
			const index = settings.stickyRoles.findIndex((entry) => entry.user === userId);
			if (index === -1) return [];

			const clone: StickyRole = { user: userId, roles };
			settings.stickyRoles[index] = clone;

			// 4.0. Return the updated roles:
			return clone.roles;
		});
	}

	public add(userId: string, roleId: string): Promise<readonly string[]> {
		return writeSettings(this.#guild, (settings) => {
			// 0.0 Get all the entries
			const entries = settings.stickyRoles;

			// 1.0. Get the index for the entry:
			const index = entries.findIndex((entry) => entry.user === userId);

			// 2.0. If the entry does not exist:
			if (index === -1) {
				// 3.0.a. Proceed to create a new sticky roles entry:
				const entry: StickyRole = { user: userId, roles: [roleId] };
				entries.push(entry);
				return entry.roles;
			}

			// 3.0.b. Otherwise read the previous entry and patch it by adding the role:
			const entry = entries[index];
			const roles = [...this.addRole(roleId, entry.roles)];

			// 3.1.b. Otherwise patch it:
			entries[index] = { user: entry.user, roles };

			// 4.0. Return the updated roles:
			return entry.roles;
		});
	}

	public remove(userId: string, roleId: string): Promise<readonly string[]> {
		return writeSettings(this.#guild, (settings) => {
			// 0.0 Get all the entries
			const entries = settings.stickyRoles;

			// 1.0. Get the index for the entry:
			const index = entries.findIndex((entry) => entry.user === userId);

			// 1.1. If the index is negative, return empty array, as the entry does not exist:
			if (index === -1) return [];

			// 2.0. Read the previous entry and patch it by removing the role:
			const entry = entries[index];
			const roles = [...this.removeRole(roleId, entry.roles)];

			if (roles.length === 0) {
				// 3.1.a. Then delete the entry from the settings:
				entries.splice(index, 1);
			} else {
				// 3.1.b. Otherwise patch it:
				entries[index] = { user: entry.user, roles };
			}

			// 4.0. Return the updated roles:
			return entry.roles;
		});
	}

	public clear(userId: string): Promise<readonly string[]> {
		return writeSettings(this.#guild, (settings) => {
			// 0.0 Get all the entries
			const entries = settings.stickyRoles;

			// 1.0. Get the index for the entry:
			const index = entries.findIndex((entry) => entry.user === userId);

			// 1.1. If the index is negative, return empty array, as the entry does not exist:
			if (index === -1) return [];

			// 2.0. Read the previous entry:
			const entry = entries[index];

			// 3.0. Remove the entry from the settings:
			entries.splice(index, 1);

			// 4.0. Return the previous roles:
			return entry.roles;
		});
	}

	private *addRole(roleId: string, roleIds: readonly string[]) {
		const emitted = new Set<string>();
		for (const role of this.cleanRoles(roleIds)) {
			if (emitted.has(role)) continue;

			emitted.add(role);
			yield role;
		}

		if (!emitted.has(roleId)) yield roleId;
	}

	private *removeRole(roleId: string, roleIds: readonly string[]) {
		const emitted = new Set<string>();
		for (const role of this.cleanRoles(roleIds)) {
			if (role === roleId) continue;
			if (emitted.has(role)) continue;

			emitted.add(role);
			yield role;
		}
	}

	private *cleanRoles(roleIds: readonly string[]) {
		const { roles } = this.#guild;
		for (const roleId of roleIds) {
			if (roles.cache.has(roleId)) yield roleId;
		}
	}
}
