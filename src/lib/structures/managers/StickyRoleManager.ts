/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { GuildSettings, StickyRole } from '@lib/types/settings/GuildSettings';
import { Guild } from 'discord.js';

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

	public async fetch(userID: string, extraContext?: unknown): Promise<readonly string[]> {
		const arrayIndex = this.getKey(userID);
		if (arrayIndex === -1) return [];

		const entry = this.entries[arrayIndex];
		const roles = [...this.cleanRoles(entry.roles)];
		if (entry.roles.length === roles.length) return entry.roles;

		const clone: StickyRole = { user: userID, roles };
		await this.#guild.settings.update(GuildSettings.StickyRoles, clone, { arrayIndex, extraContext });
		return roles;
	}

	public async add(userID: string, roleID: string, extraContext?: unknown): Promise<readonly string[]> {
		const arrayIndex = this.getKey(userID);
		if (arrayIndex === -1) {
			const entry: StickyRole = {
				user: userID,
				roles: [roleID]
			};
			await this.#guild.settings.update(GuildSettings.StickyRoles, entry, { arrayAction: 'add', extraContext });
			return entry.roles;
		}

		const entry = this.entries[arrayIndex];
		const clone: StickyRole = {
			user: userID,
			roles: [...this.addRole(roleID, entry.roles)]
		};
		await this.#guild.settings.update(GuildSettings.StickyRoles, clone, { arrayIndex, extraContext });
		return clone.roles;
	}

	public async remove(userID: string, roleID: string, extraContext?: unknown): Promise<readonly string[]> {
		const arrayIndex = this.getKey(userID);
		if (arrayIndex === -1) return [];

		const entry = this.entries[arrayIndex];
		const clone: StickyRole = {
			user: userID,
			roles: [...this.removeRole(roleID, entry.roles)]
		};

		// Remove entry if empty, update otherwise
		if (clone.roles.length === 0) {
			await this.#guild.settings.update(GuildSettings.StickyRoles, entry, { arrayAction: 'remove', arrayIndex, extraContext });
		} else {
			await this.#guild.settings.update(GuildSettings.StickyRoles, clone, { arrayIndex, extraContext });
		}

		return clone.roles;
	}

	public async clear(userID: string, extraContext?: unknown): Promise<readonly string[]> {
		const arrayIndex = this.getKey(userID);
		if (arrayIndex === -1) return [];

		const entry = this.entries[arrayIndex];
		await this.#guild.settings.update(GuildSettings.StickyRoles, entry, { arrayAction: 'remove', arrayIndex, extraContext });
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

}
