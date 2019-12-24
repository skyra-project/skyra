import { Guild, GuildMember, Role, RoleData, GuildChannel, PermissionOverwriteOption, Permissions, User, PermissionString } from 'discord.js';
import { api } from '../Models/Api';
import { GuildSettings, StickyRole } from '../../types/settings/GuildSettings';
import { deepClone } from '@klasa/utils';
import { Mutable } from '../../types/util';
import { CLIENT_ID } from '../../../../config';
import { Moderation, APIErrors } from '../constants';
import { ModerationManagerEntry } from '../../structures/ModerationManagerEntry';
import { ModerationManagerCreateData } from '../../structures/ModerationManager';
import { Events } from '../../types/Enums';
import { KlasaMessage } from 'klasa';

export const enum ModerationSetupRestriction {
	Reaction = 'roles.restricted-reaction',
	Embed = 'roles.restricted-embed',
	Attachment = 'roles.restricted-attachment',
	Voice = 'roles.restricted-voice'
}

const enum RoleDataKey {
	Muted,
	Reaction,
	Embed,
	Attachment,
	Voice
}

const kRoleDataOptions = new Map<RoleDataKey, RoleData>([
	[RoleDataKey.Muted, {
		color: 0x000000,
		hoist: false,
		mentionable: false,
		name: 'Muted',
		permissions: []
	}],
	[RoleDataKey.Attachment, {
		color: 0x000000,
		hoist: false,
		mentionable: false,
		name: 'Restricted Attachment',
		permissions: []
	}],
	[RoleDataKey.Embed, {
		color: 0x000000,
		hoist: false,
		mentionable: false,
		name: 'Restricted Embed',
		permissions: []
	}],
	[RoleDataKey.Reaction, {
		color: 0x000000,
		hoist: false,
		mentionable: false,
		name: 'Restricted Reaction',
		permissions: []
	}],
	[RoleDataKey.Voice, {
		color: 0x000000,
		hoist: false,
		mentionable: false,
		name: 'Restricted Voice',
		permissions: []
	}]
]);

const kRoleChannelOverwriteOptions = new Map<RoleDataKey, RolePermissionOverwriteOption>([
	[RoleDataKey.Muted, {
		category: {
			options: {
				SEND_MESSAGES: false,
				ADD_REACTIONS: false,
				CONNECT: false
			},
			permissions: new Permissions(['SEND_MESSAGES', 'ADD_REACTIONS', 'CONNECT'])
		},
		text: {
			options: {
				SEND_MESSAGES: false,
				ADD_REACTIONS: false
			},
			permissions: new Permissions(['SEND_MESSAGES', 'ADD_REACTIONS'])
		},
		voice: {
			options: {
				CONNECT: false
			},
			permissions: new Permissions(['CONNECT'])
		}
	}],
	[RoleDataKey.Attachment, {
		category: {
			options: {
				ATTACH_FILES: false
			},
			permissions: new Permissions(['ATTACH_FILES'])
		},
		text: {
			options: {
				ATTACH_FILES: false
			},
			permissions: new Permissions(['ATTACH_FILES'])
		},
		voice: null
	}],
	[RoleDataKey.Embed, {
		category: {
			options: {
				EMBED_LINKS: false
			},
			permissions: new Permissions(['EMBED_LINKS'])
		},
		text: {
			options: {
				EMBED_LINKS: false
			},
			permissions: new Permissions(['EMBED_LINKS'])
		},
		voice: null
	}],
	[RoleDataKey.Reaction, {
		category: {
			options: {
				ADD_REACTIONS: false
			},
			permissions: new Permissions(['ADD_REACTIONS'])
		},
		text: {
			options: {
				ADD_REACTIONS: false
			},
			permissions: new Permissions(['ADD_REACTIONS'])
		},
		voice: null
	}],
	[RoleDataKey.Voice, {
		category: {
			options: {
				CONNECT: false
			},
			permissions: new Permissions(['CONNECT'])
		},
		text: null,
		voice: {
			options: {
				CONNECT: false
			},
			permissions: new Permissions(['CONNECT'])
		}
	}]
]);

const kUnknownTypeTitle = { title: 'Unknown' };

export class ModerationActions {

	public guild: Guild;

	public constructor(guild: Guild) {
		this.guild = guild;
	}

	private get manageableChannelCount() {
		return this.guild.channels.reduce((acc, channel) => channel.manageable ? acc + 1 : acc, 0);
	}

	public async warning(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Warn);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async unWarning(rawOptions: ModerationActionOptions, caseID: number, sendOptions?: ModerationActionsSendOptions) {
		const moderationLog = await this.guild.moderation.fetch(caseID);
		if (moderationLog === null || !moderationLog.isType(Moderation.TypeCodes.Warn)) throw this.guild.language.tget('GUILD_WARN_NOT_FOUND');

		await moderationLog.invalidate();
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnWarn);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async mute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyMute(rawOptions.user_id);
		const extraData = await this.muteUser(rawOptions);
		const options = ModerationActions.fillOptions({ ...rawOptions, extra_data: extraData }, Moderation.TypeCodes.Mute);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async unMute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnMute);
		await this.removeStickyMute(options.user_id);
		const moderationLog = await this.unmuteInvalidateLog(options.user_id);

		// If Skyra does not have permissions to manage permissions, abort.
		if (!(await this.fetchMe()).permissions.has(Permissions.FLAGS.MANAGE_ROLES)) throw this.guild.language.tget('MUTE_CANNOT_MANAGE_ROLES');

		await this.unmuteUser(options, moderationLog);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async kick(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Kick);
		await this.sendDM(options, sendOptions);
		await api(this.guild.client).guilds(this.guild.id).members(options.user_id)
			.delete({ reason: this.guild.language.tget('ACTION_KICK_REASON', options.reason) });
		return (await this.guild.moderation.create(options).create())!;
	}

	public async softBan(rawOptions: ModerationActionOptions, days: number, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Softban);
		await this.sendDM(options, sendOptions);
		await api(this.guild.client).guilds(this.guild.id).bans(options.user_id)
			.put({ query: { 'delete-message-days': days }, reason: this.guild.language.tget('ACTION_SOFTBAN_REASON', options.reason) });
		await api(this.guild.client).guilds(this.guild.id).bans(options.user_id)
			.delete({ reason: this.guild.language.tget('ACTION_UNSOFTBAN_REASON', options.reason) });
		return (await this.guild.moderation.create(options).create())!;
	}

	public async ban(rawOptions: ModerationActionOptions, days: number, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Ban);
		await this.sendDM(options, sendOptions);
		await api(this.guild.client).guilds(this.guild.id).bans(options.user_id)
			.put({ query: { 'delete-message-days': days }, reason: this.guild.language.tget('ACTION_BAN_REASON', options.reason) });
		return (await this.guild.moderation.create(options).create())!;
	}

	public async unBan(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnBan);
		await api(this.guild.client).guilds(this.guild.id).bans(options.user_id)
			.delete({ reason: this.guild.language.tget('ACTION_UNBAN_REASON', options.reason) });
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async voiceMute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.VoiceMute);
		await api(this.guild.client).guilds(this.guild.id).members(options.user_id)
			.patch({ data: { deaf: true }, reason: this.guild.language.tget('ACTION_VMUTE_REASON', options.reason) });
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async unVoiceMute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnVoiceMute);
		await api(this.guild.client).guilds(this.guild.id).members(options.user_id)
			.patch({ data: { deaf: false }, reason: this.guild.language.tget('ACTION_UNVMUTE_REASON', options.reason) });
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async voiceKick(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.VoiceKick);
		await api(this.guild.client).guilds(this.guild.id).members(options.user_id)
			.patch({ data: { channel: null }, reason: this.guild.language.tget('ACTION_VKICK_REASON', options.reason) });
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async restrictReaction(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.user_id, GuildSettings.Roles.RestrictedReaction);
		await this.addRestrictionRole(rawOptions.user_id, GuildSettings.Roles.RestrictedReaction);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionReaction);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async unRestrictReaction(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.user_id, GuildSettings.Roles.RestrictedReaction);
		await this.removeRestrictionRole(rawOptions.user_id, GuildSettings.Roles.RestrictedReaction);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionReaction);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async restrictEmbed(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.user_id, GuildSettings.Roles.RestrictedEmbed);
		await this.addRestrictionRole(rawOptions.user_id, GuildSettings.Roles.RestrictedEmbed);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionEmbed);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async unRestrictEmbed(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.user_id, GuildSettings.Roles.RestrictedEmbed);
		await this.removeRestrictionRole(rawOptions.user_id, GuildSettings.Roles.RestrictedEmbed);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionEmbed);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async restrictAttachment(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.user_id, GuildSettings.Roles.RestrictedAttachment);
		await this.addRestrictionRole(rawOptions.user_id, GuildSettings.Roles.RestrictedAttachment);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionAttachment);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async unRestrictAttachment(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.user_id, GuildSettings.Roles.RestrictedAttachment);
		await this.removeRestrictionRole(rawOptions.user_id, GuildSettings.Roles.RestrictedAttachment);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionAttachment);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async restrictVoice(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.user_id, GuildSettings.Roles.RestrictedVoice);
		await this.addRestrictionRole(rawOptions.user_id, GuildSettings.Roles.RestrictedVoice);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionVoice);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public async unRestrictVoice(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.user_id, GuildSettings.Roles.RestrictedVoice);
		await this.removeRestrictionRole(rawOptions.user_id, GuildSettings.Roles.RestrictedVoice);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionVoice);
		await this.sendDM(options, sendOptions);
		return (await this.guild.moderation.create(options).create())!;
	}

	public muteSetup(message: KlasaMessage) {
		const roleID = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (roleID && this.guild.roles.has(roleID)) return Promise.reject(this.guild.language.tget('ACTION_SETUP_MUTE_EXISTS'));
		if (this.guild.roles.size >= 250) return Promise.reject(this.guild.language.tget('ACTION_SETUP_TOO_MANY_ROLES'));

		// Set up the shared role setup
		return this.sharedRoleSetup(message, RoleDataKey.Muted, GuildSettings.Roles.Muted);
	}

	public restrictionSetup(message: KlasaMessage, path: ModerationSetupRestriction) {
		const roleID = this.guild.settings.get(path) as string | null;
		if (roleID !== null && this.guild.roles.has(roleID)) return Promise.reject(this.guild.language.tget('ACTION_SETUP_RESTRICTION_EXISTS'));
		if (this.guild.roles.size >= 250) return Promise.reject(this.guild.language.tget('ACTION_SETUP_TOO_MANY_ROLES'));

		// Set up the shared role setup
		return this.sharedRoleSetup(message, ModerationActions.getRoleDataKeyFromSchemaKey(path), path);
	}

	private async sharedRoleSetup(message: KlasaMessage, key: RoleDataKey, path: string) {
		const roleData = kRoleDataOptions.get(key)!;
		const role = await this.guild.roles.create({ data: roleData, reason: `[Role Setup] Authorized by ${message.author.username} (${message.author.id}).` });
		await this.guild.settings.update(path, role, { throwOnError: true });

		if (await message.ask(this.guild.language.tget('ACTION_SHARED_ROLE_SETUP', role.name, this.manageableChannelCount, this.displayPermissions(key)))) {
			await this.updatePermissionsForCategoryChannels(role, key);
			await this.updatePermissionsForTextOrVoiceChannels(role, key);
		}
	}

	private displayPermissions(key: RoleDataKey) {
		const options = kRoleChannelOverwriteOptions.get(key)!;
		const output: string[] = [];
		const permissions = this.guild.language.PERMISSIONS;
		for (const keyOption of Object.keys(options.category.options)) {
			output.push(permissions[keyOption as PermissionString] || keyOption);
		}
		return output;
	}

	private async fetchMe() {
		return this.guild.me || this.guild.members.fetch(CLIENT_ID);
	}

	private async sendDM(options: ModerationManagerCreateData & { reason: string | null }, sendOptions: ModerationActionsSendOptions = {}) {
		if (sendOptions.send) {
			try {
				const target = await this.guild.client.users.fetch(options.user_id);
				const { title } = Moderation.metadata.get(options.type) || kUnknownTypeTitle;
				if (sendOptions.moderator) {
					await target.sendLocale('COMMAND_MODERATION_DM', [this.guild.name, title, options.reason, options.duration, sendOptions.moderator]).catch(() => null);
				} else {
					await target.sendLocale('COMMAND_MODERATION_DM_ANONYMOUS', [this.guild.name, title, options.duration, options.reason]).catch(() => null);
				}
			} catch (error) {
				if (error.code === APIErrors.CannotMessageUser) return;
				this.guild.client.emit(Events.Error, error);
			}
		}
	}

	private addStickyMute(id: string) {
		const mutedRole = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (mutedRole === null) return Promise.reject(this.guild.language.tget('MUTE_NOT_CONFIGURED'));
		return this.addStickyRole(id, mutedRole);
	}

	private removeStickyMute(id: string) {
		const mutedRole = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (mutedRole === null) return Promise.reject(this.guild.language.tget('MUTE_NOT_CONFIGURED'));
		return this.removeStickyRole(id, mutedRole);
	}

	private async muteUser(rawOptions: ModerationActionOptions) {
		try {
			const member = await this.guild.members.fetch(rawOptions.user_id);
			return this.muteUserInGuild(member, this.guild.language.tget('ACTION_MUTE_REASON', rawOptions.reason || null));
		} catch (error) {
			if (error.code === APIErrors.UnknownMember) throw this.guild.language.tget('ACTION_REQUIRED_MEMBER');
			throw error;
		}
	}

	private async muteUserInGuild(member: GuildMember, reason: string) {
		const roleID = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (roleID === null) throw this.guild.language.tget('MUTE_NOT_CONFIGURED');

		const role = this.guild.roles.get(roleID);
		if (typeof role === 'undefined') {
			await this.guild.settings.reset(GuildSettings.Roles.Muted, { throwOnError: true });
			throw this.guild.language.tget('MUTE_NOT_CONFIGURED');
		}

		const { position } = (await this.fetchMe()).roles.highest;
		const extracted = ModerationActions.muteExtractRoles(member, position);
		extracted.keepRoles.push(roleID);

		await member.edit({ roles: extracted.keepRoles }, reason);
		return extracted.removedRoles;
	}

	private async unmuteUser(options: ModerationManagerCreateData & { reason: string | null }, moderationLog: ModerationManagerEntry | null) {
		try {
			const member = await this.guild.members.fetch(options.user_id);
			return (moderationLog === null
				? this.unmuteUserInGuildWithoutData(member, this.guild.language.tget('ACTION_UNMUTE_REASON', options.reason))
				: this.unmuteUserInGuildWithData(member, this.guild.language.tget('ACTION_UNMUTE_REASON', options.reason), moderationLog));
		} catch (error) {
			if (error.code !== APIErrors.UnknownMember) throw error;
		}
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
		throw this.guild.language.tget('MUTE_NOT_EXISTS');
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
		if (roleID === null) throw this.guild.language.tget('MUTE_NOT_CONFIGURED');

		// Retrieve the role instance from the role ID, reset and return false if it does not exist.
		const role = this.guild.roles.get(roleID);
		if (typeof role === 'undefined') {
			await this.guild.settings.reset(GuildSettings.Roles.Muted, { throwOnError: true });
			throw this.guild.language.tget('MUTE_NOT_CONFIGURED');
		}

		// If the user has the role, begin processing the data.
		if (member.roles.has(roleID)) {
			// Fetch self and check if the bot has enough role hierarchy to manage the role, return false when not.
			const { position } = (await this.fetchMe()).roles.highest;
			if (role.position >= position) throw this.guild.language.tget('MUTE_LOW_HIERARCHY');

			// Remove the role from the member.
			await member.roles.remove(roleID, reason);
			return;
		}
		throw this.guild.language.tget('MUTE_NOT_IN_MEMBER');
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

	private async addStickyRole(id: string, roleID: string) {
		const guildStickyRoles = this.guild.settings.get(GuildSettings.StickyRoles);
		const stickyRolesIndex = guildStickyRoles.findIndex(stickyRole => stickyRole.user === id);
		if (stickyRolesIndex === -1) {
			const stickyRoles: StickyRole = {
				user: id,
				roles: [roleID]
			};
			await this.guild.settings.update(GuildSettings.StickyRoles, stickyRoles, { throwOnError: true, arrayAction: 'add' });
			return;
		}

		const stickyRoles = guildStickyRoles[stickyRolesIndex];
		if (stickyRoles.roles.includes(roleID)) return;

		const clone = deepClone(stickyRoles) as Mutable<StickyRole>;
		clone.roles.push(roleID);
		await this.guild.settings.update(GuildSettings.StickyRoles, stickyRoles, { arrayIndex: stickyRolesIndex, throwOnError: true });
	}

	private async removeStickyRole(id: string, roleID: string) {
		const guildStickyRoles = this.guild.settings.get(GuildSettings.StickyRoles);
		const stickyRolesIndex = guildStickyRoles.findIndex(stickyRole => stickyRole.user === id);
		if (stickyRolesIndex === -1) return;

		const stickyRoles = guildStickyRoles[stickyRolesIndex];
		const roleIndex = stickyRoles.roles.indexOf(roleID);
		if (roleIndex === -1) return;

		if (stickyRoles.roles.length > 1) {
			// If there are more than one role, remove the muted one and update the entry keeping the rest.
			const clone = deepClone(stickyRoles) as Mutable<StickyRole>;
			clone.roles.splice(roleIndex, 1);
			await this.guild.settings.update(GuildSettings.StickyRoles, clone, { arrayIndex: stickyRolesIndex, throwOnError: true });
		} else {
			// Else clone the array, remove the entry, and update with action overwrite.
			const cloneStickyRoles = guildStickyRoles.slice(0);
			cloneStickyRoles.splice(stickyRolesIndex, 1);
			await this.guild.settings.update(GuildSettings.StickyRoles, cloneStickyRoles, { throwOnError: true, arrayAction: 'overwrite' });
		}
	}

	private addStickyRestriction(id: string, roleID: string) {
		const restrictedRole = this.guild.settings.get(roleID) as string | null;
		if (restrictedRole === null) return Promise.reject(this.guild.language.tget('RESTRICTION_NOT_CONFIGURED'));
		return this.addStickyRole(id, restrictedRole);
	}

	private async addRestrictionRole(id: string, key: string) {
		const roleID = this.guild.settings.get(key) as string | null;
		if (roleID === null) throw this.guild.language.tget('RESTRICTION_NOT_CONFIGURED');
		await api(this.guild.client).guilds(this.guild.id).members(id)
			.roles(roleID)
			.put();
	}

	private removeStickyRestriction(id: string, roleID: string) {
		const restrictedRole = this.guild.settings.get(roleID) as string | null;
		if (restrictedRole === null) return Promise.reject(this.guild.language.tget('RESTRICTION_NOT_CONFIGURED'));
		return this.removeStickyRole(id, restrictedRole);
	}

	private async removeRestrictionRole(id: string, key: string) {
		const roleID = this.guild.settings.get(key) as string | null;
		if (roleID === null) throw this.guild.language.tget('RESTRICTION_NOT_CONFIGURED');
		try {
			await api(this.guild.client).guilds(this.guild.id).members(id)
				.roles(roleID)
				.delete();
		} catch (error) {
			if (error.code !== APIErrors.UnknownMember) throw error;
		}
	}

	private async updatePermissionsForCategoryChannels(role: Role, dataKey: RoleDataKey) {
		const options = kRoleChannelOverwriteOptions.get(dataKey)!;
		const promises: Promise<unknown>[] = [];
		for (const channel of this.guild.channels.values()) {
			if (channel.type === 'category' && channel.manageable) {
				promises.push(ModerationActions.updatePermissionsForChannel(role, channel, options.category));
			}
		}

		await Promise.all(promises);
	}

	private async updatePermissionsForTextOrVoiceChannels(role: Role, dataKey: RoleDataKey) {
		const options = kRoleChannelOverwriteOptions.get(dataKey)!;
		const promises: Promise<unknown>[] = [];
		for (const channel of this.guild.channels.values()) {
			if (!channel.manageable) continue;
			if (channel.type === 'text' || channel.type === 'news' || channel.type === 'store') {
				promises.push(ModerationActions.updatePermissionsForChannel(role, channel, options.text));
			} else if (channel.type === 'voice') {
				promises.push(ModerationActions.updatePermissionsForChannel(role, channel, options.voice));
			}
		}

		await Promise.all(promises);
	}

	private static getRoleDataKeyFromSchemaKey(key: ModerationSetupRestriction): RoleDataKey {
		switch (key) {
			case ModerationSetupRestriction.Attachment: return RoleDataKey.Attachment;
			case ModerationSetupRestriction.Embed: return RoleDataKey.Embed;
			case ModerationSetupRestriction.Reaction: return RoleDataKey.Reaction;
			case ModerationSetupRestriction.Voice: return RoleDataKey.Voice;
		}
	}

	private static fillOptions(rawOptions: ModerationActionOptions, type: Moderation.TypeCodes) {
		const options = { reason: null, ...rawOptions, type };
		if (typeof options.reason === 'undefined') options.reason = null;
		return options;
	}

	private static muteExtractRoles(member: GuildMember, selfPosition: number) {
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

	private static async updatePermissionsForChannel(role: Role, channel: GuildChannel, rolePermissions: RolePermissionOverwriteOptionField | null) {
		if (rolePermissions === null) return;

		const current = channel.permissionOverwrites.get(role.id);
		if (typeof current === 'undefined') {
			// If no permissions overwrites exists, create a new one.
			await channel.updateOverwrite(role, rolePermissions.options, '[Setup] Updated channel for Muted Role.');
		} else if (!current.deny.has(rolePermissions.permissions)) {
			// If one exists and does not have the deny fields, tweak the existing one to keep all the allowed and
			// denied, but also add the ones that must be denied for the mute role to work.
			const allowed = current.allow.toArray().map(permission => [permission, true]);
			const denied = current.allow.toArray().map(permission => [permission, false]);
			const mixed = Object.fromEntries(allowed.concat(denied));
			await channel.updateOverwrite(role, { ...mixed, ...rolePermissions.options });
		}
	}

}

export interface ModerationActionsSendOptions {
	send?: boolean;
	moderator?: User | null;
}

interface RolePermissionOverwriteOption {
	category: RolePermissionOverwriteOptionField;
	text: RolePermissionOverwriteOptionField | null;
	voice: RolePermissionOverwriteOptionField | null;
}

interface RolePermissionOverwriteOptionField {
	options: PermissionOverwriteOption;
	permissions: Permissions;
}

export type ModerationActionOptions = Omit<ModerationManagerCreateData, 'type'>;
