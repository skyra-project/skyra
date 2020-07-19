/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { GuildSettings, StickyRole } from '@lib/types/settings/GuildSettings';
import { Guild } from 'discord.js';
import { ArrayActions } from 'klasa';

export interface StickyRoleManagerExtraContext {
	author: string;
}

export class StickyRoleManager {

	#guild: Guild;

	public constructor(guild: Guild) {
		this.#guild = guild;
	}

	private get entries() {
		return this.#guild.settings.get(GuildSettings.StickyRoles);
	}

	public get(userID: string): readonly string[] {
		return this.entries.find(entry => entry.user === userID)?.roles ?? [];
	}

	public async fetch(userID: string, extraContext?: StickyRoleManagerExtraContext): Promise<readonly string[]> {
		// 1.0. If the entry does not exist, return empty array
		const arrayIndex = this.getKey(userID);
		if (arrayIndex === -1) return [];

		// 2.0. Read the entry and clean the roles:
		const entry = this.entries[arrayIndex];
		const roles = [...this.cleanRoles(entry.roles)];

		// 2.1. If the roles are unchanged (have the same size), return them:
		if (entry.roles.length === roles.length) return entry.roles;

		// 2.2. If the roles are changed and leds to an empty array:
		if (roles.length === 0) {
			// 3.0.a. Then delete the entry from the settings:
			await this.removeAt(arrayIndex);
			return roles;
		}

		// 3.0.b. Make a clone with the userID and the fixed roles array:
		const clone: StickyRole = { user: userID, roles };
		await this.#guild.settings.update(GuildSettings.StickyRoles, clone, {
			arrayIndex,
			extraContext
		});

		// 4.0. Return the updated roles:
		return roles;
	}

	public async add(userID: string, roleID: string, extraContext?: StickyRoleManagerExtraContext): Promise<readonly string[]> {
		// 1.0. Get the index of the entry:
		const arrayIndex = this.getKey(userID);

		// 2.0. If the entry does not exist:
		if (arrayIndex === -1) {
			// 3.0.a. Proceed to create a new sticky roles entry:
			const value: StickyRole = { user: userID, roles: [roleID] };
			await this.#guild.settings.update(GuildSettings.StickyRoles, value, {
				arrayAction: ArrayActions.Add,
				extraContext
			});
			return value.roles;
		}

		// 3.0.b. Otherwise read the previous entry and patch it by adding the role:
		const entry = this.entries[arrayIndex];
		const clone: StickyRole = { user: userID, roles: [...this.addRole(roleID, entry.roles)] };
		await this.#guild.settings.update(GuildSettings.StickyRoles, clone, {
			arrayIndex,
			extraContext
		});

		// 4.0. Return the updated roles:
		return clone.roles;
	}

	public async remove(userID: string, roleID: string, extraContext?: StickyRoleManagerExtraContext): Promise<readonly string[]> {
		// 1.0. Get the index for the entry:
		const arrayIndex = this.getKey(userID);

		// 1.1. If the index is negative, return empty array, as the entry does not exist:
		if (arrayIndex === -1) return [];

		// 2.0. Read the previous entry and patch it by removing the role:
		const entry = this.entries[arrayIndex];
		const roles = [...this.removeRole(roleID, entry.roles)];

		// 3.0. If the new roles end up being an empty array...
		if (roles.length === 0) {
			// 3.1.a. Then delete the entry from the settings:
			await this.removeAt(arrayIndex, extraContext);
		} else {
			// 3.1.b. Otherwise patch it:
			const clone: StickyRole = { user: userID, roles };
			await this.#guild.settings.update(GuildSettings.StickyRoles, clone, {
				arrayIndex,
				extraContext
			});
		}

		// 4.0. Return the updated roles:
		return roles;
	}

	public async clear(userID: string, extraContext?: StickyRoleManagerExtraContext): Promise<readonly string[]> {
		// 1.0. Get the index for the entry:
		const arrayIndex = this.getKey(userID);

		// 1.1. If the index is negative, return empty array, as the entry does not exist:
		if (arrayIndex === -1) return [];

		// 2.0. Read the previous entry:
		const entry = this.entries[arrayIndex];

		// 3.0. Remove the entry from the settings:
		await this.removeAt(arrayIndex, extraContext);

		// 4.0. Return the previous roles:
		return entry.roles;
	}

	private getKey(userID: string) {
		return this.entries.findIndex(entry => entry.user === userID);
	}

	private *addRole(roleID: string, roleIDs: readonly string[]) {
		const emitted = new Set<string>();
		for (const role of this.cleanRoles(roleIDs)) {
			if (emitted.has(role)) continue;

			emitted.add(role);
			yield role;
		}

		if (!emitted.has(roleID)) yield roleID;
	}

	private *removeRole(roleID: string, roleIDs: readonly string[]) {
		const emitted = new Set<string>();
		for (const role of this.cleanRoles(roleIDs)) {
			if (role === roleID) continue;
			if (emitted.has(role)) continue;

			emitted.add(role);
			yield role;
		}
	}

	private *cleanRoles(roleIDs: readonly string[]) {
		const { roles } = this.#guild;
		for (const roleID of roleIDs) {
			if (roles.has(roleID)) yield roleID;
		}
	}

	private removeAt(index: number, extraContext?: unknown) {
		// 1.0. Create a clone of the array, we do not want to mutate the original one:
		const clone = this.entries.slice();

		// 2.0. Remove the desired entry:
		clone.splice(index, 1);

		// 3.0. Patch invalid roles and remove empty entries:
		this.cleanAllRoles(clone);

		return this.#guild.settings.update(GuildSettings.StickyRoles, clone, {
			arrayAction: ArrayActions.Overwrite,
			extraContext
		});
	}

	private cleanAllRoles(stickyRoles: StickyRole[]) {
		// 1.0. We check if the array is empty, this is a must as we will otherwise
		//      read an out-of-bounds value.
		if (stickyRoles.length === 0) return;

		// Iterate from last to first, why? Because when we do `splice(i, 1)`, we
		// remove one entry from the array, making it smaller.Doing so in reverse
		// is more efficient as the following operation:
		//
		//   const i = 2;
		//   const arr = [0, 1, 2, 3, 4];
		//   arr.splice(i, 1);
		//
		// Will result on: [0, 1, 3, 4]
		//
		// The array in the range [0..i) remains unchanged, whereas [i..n) is modified.

		// 2.0. Start the index from the last element:
		//        const arr = [0, 1, 2, 3, 4];
		//        const last = arr.length - 1; // 5 - 1 = 4
		for (let i = stickyRoles.length - 1; i >= 0; --i) {
			// 3.0. Read the entry at the index:
			const entry = stickyRoles[i];

			// 4.0. Mutate the roles to remove all duplicates and removed roles:
			entry.roles = [...this.cleanRoles(entry.roles)];

			// 5.0. If empty, we will remove it from the settings, validating the
			//      previous step's requirements.
			if (entry.roles.length === 0) stickyRoles.splice(i, 1);
		}
	}

}
