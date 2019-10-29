import { Guild, GuildMember } from 'discord.js';
import { api } from '../Models/Api';
import { GuildSettings, StickyRole } from '../../types/settings/GuildSettings';
import { deepClone } from '@klasa/utils';
import { Mutable } from '../../types/util';

export class ModerationActions {

	public guild: Guild;

	public constructor(guild: Guild) {
		this.guild = guild;
	}

	public async mute(id: string, reason: string) {
		await this.addStickyMute(id);

		try {
			const member = await this.guild.members.fetch(id);
			return this.muteUserInGuild(member, reason)
		} catch {
			return this.muteUserNotInGuild(id, reason);
		}
	}

	public async unmute(id: string, reason: string) {
		try {
			await this.removeStickyMute(id);
			return this.unmuteUserWithSticky(id, reason);
		} catch {
			return this.unmuteUserWithoutSticky(id, reason);
		}
	}

	public async kick(id: string, reason: string) {
		await api(this.guild.client).guilds(this.guild.id).members(id).delete({ reason });
		return true;
	}

	public async ban(id: string, days: number, reason: string) {
		await api(this.guild.client).guilds(this.guild.id).bans(id).put({ query: { 'delete-message-days': days }, reason });
		return true;
	}

	public async unban(id: string, reason: string) {
		await api(this.guild.client).guilds(this.guild.id).bans(id).delete({ reason });
		return true;
	}

	public async softban(id: string, days: number, reason: string) {
		await this.ban(id, days, reason);
		await this.unban(id, reason);
		return true;
	}

	private async addStickyMute(id: string) {
		const mutedRole = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (mutedRole === null) throw this.guild.language.tget('COMMAND_MUTE_UNCONFIGURED');

		const guildStickyRoles = this.guild.settings.get(GuildSettings.StickyRoles);
		const stickyRolesIndex = guildStickyRoles.findIndex(stickyRole => stickyRole.user === id);
		if (stickyRolesIndex === -1) {
			const stickyRoles: StickyRole = {
				user: id,
				roles: [mutedRole]
			};
			await this.guild.settings.update(GuildSettings.StickyRoles, stickyRoles, { throwOnError: true, arrayAction: 'add' });
			return true;
		}

		const stickyRoles = guildStickyRoles[stickyRolesIndex];
		if (stickyRoles.roles.includes(mutedRole)) return true;

		const clone = deepClone(stickyRoles) as Mutable<StickyRole>;
		clone.roles.push(mutedRole);
		await this.guild.settings.update(GuildSettings.StickyRoles, stickyRoles, { arrayIndex: stickyRolesIndex, throwOnError: true });
		return true;
	}

	private async removeStickyMute(id: string) {
		const mutedRole = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (mutedRole === null) throw this.guild.language.tget('COMMAND_MUTE_UNCONFIGURED');

		const guildStickyRoles = this.guild.settings.get(GuildSettings.StickyRoles);
		const stickyRolesIndex = guildStickyRoles.findIndex(stickyRole => stickyRole.user === id);
		if (stickyRolesIndex === -1) return false;

		const stickyRoles = guildStickyRoles[stickyRolesIndex];
		const roleIndex = stickyRoles.roles.indexOf(mutedRole);
		if (roleIndex === -1) return false;

		const clone = deepClone(stickyRoles) as Mutable<StickyRole>;
		clone.roles.splice(roleIndex, 1);

		await (clone.roles.length
			? this.guild.settings.update(GuildSettings.StickyRoles, clone, { arrayIndex: stickyRolesIndex, throwOnError: true })
			: this.guild.settings.update(GuildSettings.StickyRoles, stickyRoles, { arrayIndex: stickyRolesIndex, throwOnError: true, arrayAction: 'remove' }));

		return true;
	}

	private async muteUserInGuild(id: GuildMember, reason: string) { }

	private async muteUserNotInGuild(id: string, reason: string) { }

	private async unmuteUserWithSticky(id: string, reason: string) {
		try {
			const member = await this.guild.members.fetch(id);
			return this.unmuteUserInGuild(member, reason)
		} catch {
			return this.unmuteUserNotInGuild(id, reason);
		}
	}
	private async unmuteUserWithoutSticky(id: string, reason: string) { }

	private async unmuteUserInGuild(id: GuildMember, reason: string) { }

	private async unmuteUserNotInGuild(id: string, reason: string) { }

}
