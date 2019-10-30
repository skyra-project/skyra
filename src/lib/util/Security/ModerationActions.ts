import { Guild, GuildMember, Role, RoleData, GuildChannel, CategoryChannel, PermissionOverwriteOption, Permissions } from 'discord.js';
import { api } from '../Models/Api';
import { GuildSettings, StickyRole } from '../../types/settings/GuildSettings';
import { deepClone } from '@klasa/utils';
import { Mutable } from '../../types/util';
import { CLIENT_ID } from '../../../../config';
import { Moderation } from '../constants';
import { ModerationManagerEntry } from '../../structures/ModerationManagerEntry';

const kMuteRoleDataOptions: RoleData = {
	color: 0x795548,
	hoist: false,
	mentionable: false,
	name: 'Muted',
	permissions: []
};

const kMuteCategoryOverwriteOptions: PermissionOverwriteOption = {
	SEND_MESSAGES: false,
	ADD_REACTIONS: false,
	CONNECT: false
};

const kVoiceOverwriteOptions: PermissionOverwriteOption = {
	CONNECT: false
};

const kVoiceOverwriteBitfield = new Permissions(['CONNECT']);

const kTextOverwriteOptions: PermissionOverwriteOption = {
	SEND_MESSAGES: false,
	ADD_REACTIONS: false
};

const kTextOverwriteBitfield = new Permissions(['SEND_MESSAGES', 'ADD_REACTIONS']);

export class ModerationActions {

	public guild: Guild;

	public constructor(guild: Guild) {
		this.guild = guild;
	}

	public async mute(id: string, reason: string | null) {
		await this.addStickyMute(id);

		try {
			const member = await this.guild.members.fetch(id);
			return this.muteUserInGuild(member, this.guild.language.tget('ACTION_MUTE_REASON', reason));
		} catch {
			return [] as string[];
		}
	}

	public async unmute(id: string, reason: string | null) {
		await this.removeStickyMute(id);
		const moderationLog = await this.unmuteInvalidateLog(id);

		// If Skyra does not have permissions to manage permissions, abort.
		if (!(await this.fetchMe()).permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return null;

		try {
			const member = await this.guild.members.fetch(id);
			return moderationLog === null
				? this.unmuteUserInGuildWithoutData(member, this.guild.language.tget('ACTION_UNMUTE_REASON', reason))
				: this.unmuteUserInGuildWithData(member, this.guild.language.tget('ACTION_UNMUTE_REASON', reason), moderationLog);
		} catch {
			return null;
		}
	}

	public async kick(id: string, reason: string | null) {
		await api(this.guild.client).guilds(this.guild.id).members(id)
			.delete({ reason: this.guild.language.tget('ACTION_KICK_REASON', reason) });
		return null;
	}

	public async ban(id: string, days: number, reason: string | null) {
		await api(this.guild.client).guilds(this.guild.id).bans(id)
			.put({ query: { 'delete-message-days': days }, reason: this.guild.language.tget('ACTION_BAN_REASON', reason) });
		return null;
	}

	public async unban(id: string, reason: string | null) {
		await api(this.guild.client).guilds(this.guild.id).bans(id)
			.delete({ reason: this.guild.language.tget('ACTION_UNBAN_REASON', reason) });
		return null;
	}

	public async muteSetup() {
		const roleID = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (roleID && this.guild.roles.has(roleID)) throw this.guild.language.tget('SYSTEM_GUILD_MUTECREATE_MUTEEXISTS');
		if (this.guild.roles.size >= 250) throw this.guild.language.tget('SYSTEM_GUILD_MUTECREATE_TOOMANYROLES');

		const role = await this.guild.roles.create({ data: kMuteRoleDataOptions, reason: '[Setup] Creating Muted Role.' });
		await this.guild.settings.update(GuildSettings.Roles.Muted, role, { throwOnError: true });

		await this.muteSetupCategoryChannels(role);
		await this.muteSetupTextOrVoiceChannels(role);
	}

	public async softban(id: string, days: number, reason: string | null) {
		await api(this.guild.client).guilds(this.guild.id).bans(id)
			.put({ query: { 'delete-message-days': days }, reason: this.guild.language.tget('ACTION_SOFTBAN_REASON', reason) });
		await api(this.guild.client).guilds(this.guild.id).bans(id)
			.delete({ reason: this.guild.language.tget('ACTION_UNSOFTBAN_REASON', reason) });
		return null;
	}

	private async fetchMe() {
		return this.guild.me || this.guild.members.fetch(CLIENT_ID);
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

	private async muteUserInGuild(member: GuildMember, reason: string) {
		const roleID = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (roleID === null) return null;

		const role = this.guild.roles.get(roleID);
		if (typeof role === 'undefined') {
			await this.guild.settings.reset(GuildSettings.Roles.Muted, { throwOnError: true });
			return null;
		}

		const { position } = (await this.fetchMe()).roles.highest;
		const extracted = this.muteExtractRoles(member, position);
		extracted.keepRoles.push(roleID);

		await member.edit({ roles: extracted.keepRoles }, reason);
		return extracted.removedRoles;
	}

	private muteExtractRoles(member: GuildMember, selfPosition: number) {
		const keepRoles: string[] = [];
		const removedRoles: string[] = [];

		// Iterate over all the member's roles.
		for (const [id, role] of member.roles.entries()) {
			// Managed roles cannot be removed.
			if (role.managed) keepRoles.push(id);

			// Roles with higher hierarchy position cannot be removed.
			else if (role.position >= selfPosition) keepRoles.push(id);

			// Else it is fine to remove the role.
			else removedRoles.push(id);
		}

		return { keepRoles, removedRoles };
	}

	/**
	 * Invalidate the last valid moderation log with type of mute.
	 * @since 5.3.0
	 * @param id The member id to invalidate the moderation log from
	 */
	private async unmuteInvalidateLog(id: string) {
		// Retrieve all moderation logs regarding a user.
		const logs = await this.guild.moderation.fetch(id);

		// Filter all logs by valid and by type of mute (isType will include TemporaryMute and FastTemporaryMute).
		const log = logs.filter(log => !log.invalidated && log.isType(Moderation.TypeCodes.Mute)).last();

		// If a moderation log exists, invalidate and return it, else return null.
		if (typeof log !== 'undefined') {
			await log.invalidate();
			return log;
		}
		return null;
	}

	/**
	 * Unmute a user who is in a guild and has a running moderation log.
	 * @since 5.3.0
	 * @param member The member to unmute
	 * @param reason The reason to send for audit logs when unmuting
	 * @param moderationLog The moderation manager that defined the formal mute
	 */
	private async unmuteUserInGuildWithData(member: GuildMember, reason: string, moderationLog: ModerationManagerEntry) {
		const roleID = this.guild.settings.get(GuildSettings.Roles.Muted);
		const { position } = (await this.fetchMe()).roles.highest;
		const rawRoleIDs = Array.isArray(moderationLog.extraData)
			? moderationLog.extraData
			: [];
		const roles = this.unmuteExtractRoles(member, roleID, position, rawRoleIDs);
		await member.edit({ roles }, reason);
		return roles;
	}

	/**
	 * Unmute a user who is in a guild and does not have a running moderation log, e.g. when unmuting somebody who
	 * merely has the muted role.
	 * @since 5.3.0
	 * @param member The member to unmute
	 * @param reason The reason to send for audit logs when unmuting
	 */
	private async unmuteUserInGuildWithoutData(member: GuildMember, reason: string) {
		// Retrieve the role ID of the mute role, return false if it does not exist.
		const roleID = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (roleID === null) return null;

		// Retrieve the role instance from the role ID, reset and return false if it does not exist.
		const role = this.guild.roles.get(roleID);
		if (typeof role === 'undefined') {
			await this.guild.settings.reset(GuildSettings.Roles.Muted, { throwOnError: true });
			return null;
		}

		// If the user has the role, begin processing the data.
		if (member.roles.has(roleID)) {
			// Fetch self and check if the bot has enough role hierarchy to manage the role, return false when not.
			const { position } = (await this.fetchMe()).roles.highest;
			if (role.position >= position) return null;

			// Remove the role from the member.
			await member.roles.remove(roleID, reason);
			return [roleID];
		}
		return null;
	}

	private unmuteExtractRoles(member: GuildMember, roleID: string, selfPosition: number, rawIdentifiers: readonly string[] | null) {
		if (rawIdentifiers === null) rawIdentifiers = [];

		const rawRoles: Role[] = [];
		for (const id of rawIdentifiers) {
			const role = this.guild.roles.get(id);
			if (typeof role !== 'undefined') rawRoles.push(role);
		}

		const roles = new Set<string>(member.roles.keys());
		for (const rawRole of rawRoles) {
			if (rawRole.position < selfPosition) roles.add(rawRole.id);
		}

		roles.delete(roleID);

		return [...roles];
	}

	private async muteSetupCategoryChannels(role: Role) {
		const promises: Promise<unknown>[] = [];
		for (const channel of this.guild.channels.values()) {
			if (channel.type === 'category' && channel.manageable) {
				promises.push(this.muteSetupCategoryChannel(role, channel as CategoryChannel));
			}
		}

		await Promise.all(promises);
	}

	private async muteSetupCategoryChannel(role: Role, channel: CategoryChannel) {
		await channel.updateOverwrite(role, kMuteCategoryOverwriteOptions, '[Setup] Updated channel for Muted Role.');
	}

	private async muteSetupTextOrVoiceChannels(role: Role) {
		const promises: Promise<unknown>[] = [];
		for (const channel of this.guild.channels.values()) {
			if (!channel.manageable) continue;
			if (channel.type === 'text' || channel.type === 'news' || channel.type === 'store') {
				promises.push(this.muteSetupTextChannel(role, channel));
			} else if (channel.type === 'voice') {
				promises.push(this.muteSetupVoiceChannel(role, channel));
			}
		}

		await Promise.all(promises);
	}

	private muteSetupVoiceChannel(role: Role, channel: GuildChannel) {
		return this.muteSetupAnyChannel(role, channel, kVoiceOverwriteOptions, kVoiceOverwriteBitfield);
	}

	private muteSetupTextChannel(role: Role, channel: GuildChannel) {
		return this.muteSetupAnyChannel(role, channel, kTextOverwriteOptions, kTextOverwriteBitfield);
	}

	private async muteSetupAnyChannel(role: Role, channel: GuildChannel, overwriteOptions: PermissionOverwriteOption, overwriteBitfield: Permissions) {
		const current = channel.permissionOverwrites.get(role.id);
		if (typeof current === 'undefined') {
			// If no permissions overwrites exists, create a new one.
			await channel.updateOverwrite(role, overwriteOptions, '[Setup] Updated channel for Muted Role.');
		} else if (!current.deny.has(overwriteBitfield)) {
			// If one exists and does not have the deny fields, tweak the existing one to keep all the allowed and
			// denied, but also add the ones that must be denied for the mute role to work.
			const allowed = current.allow.toArray().map(permission => [permission, true]);
			const denied = current.allow.toArray().map(permission => [permission, false]);
			const mixed = Object.fromEntries(allowed.concat(denied));
			await channel.updateOverwrite(role, { ...mixed, ...overwriteOptions });
		}
	}

}
