import { ModerationManagerCreateData } from '@lib/structures/managers/ModerationManager';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ModerationEntity } from '@orm/entities/ModerationEntity';
import { CLIENT_ID } from '@root/config';
import { APIErrors, Moderation } from '@utils/constants';
import { api } from '@utils/Models/Api';
import {
	DiscordAPIError,
	Guild,
	GuildChannel,
	GuildMember,
	PermissionOverwriteOption,
	Permissions,
	PermissionString,
	Role,
	RoleData,
	User
} from 'discord.js';
import { KlasaMessage } from 'klasa';

export const enum ModerationSetupRestriction {
	Reaction = 'roles.restricted-reaction',
	Embed = 'roles.restricted-embed',
	Emoji = 'roles.restricted-emoji',
	Attachment = 'roles.restricted-attachment',
	Voice = 'roles.restricted-voice'
}

const enum RoleDataKey {
	Muted,
	Reaction,
	Embed,
	Emoji,
	Attachment,
	Voice
}

const kRoleDataOptions = new Map<RoleDataKey, RoleData>([
	[
		RoleDataKey.Muted,
		{
			color: 0x000000,
			hoist: false,
			mentionable: false,
			name: 'Muted',
			permissions: []
		}
	],
	[
		RoleDataKey.Attachment,
		{
			color: 0x000000,
			hoist: false,
			mentionable: false,
			name: 'Restricted Attachment',
			permissions: []
		}
	],
	[
		RoleDataKey.Embed,
		{
			color: 0x000000,
			hoist: false,
			mentionable: false,
			name: 'Restricted Embed',
			permissions: []
		}
	],
	[
		RoleDataKey.Emoji,
		{
			color: 0x000000,
			hoist: false,
			mentionable: false,
			name: 'Restricted Emoji',
			permissions: []
		}
	],
	[
		RoleDataKey.Reaction,
		{
			color: 0x000000,
			hoist: false,
			mentionable: false,
			name: 'Restricted Reaction',
			permissions: []
		}
	],
	[
		RoleDataKey.Voice,
		{
			color: 0x000000,
			hoist: false,
			mentionable: false,
			name: 'Restricted Voice',
			permissions: []
		}
	]
]);

const kRoleChannelOverwriteOptions = new Map<RoleDataKey, RolePermissionOverwriteOption>([
	[
		RoleDataKey.Muted,
		{
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
		}
	],
	[
		RoleDataKey.Attachment,
		{
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
		}
	],
	[
		RoleDataKey.Embed,
		{
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
		}
	],
	[
		RoleDataKey.Emoji,
		{
			category: {
				options: {
					USE_EXTERNAL_EMOJIS: false
				},
				permissions: new Permissions(['USE_EXTERNAL_EMOJIS'])
			},
			text: {
				options: {
					USE_EXTERNAL_EMOJIS: false
				},
				permissions: new Permissions(['USE_EXTERNAL_EMOJIS'])
			},
			voice: null
		}
	],
	[
		RoleDataKey.Reaction,
		{
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
		}
	],
	[
		RoleDataKey.Voice,
		{
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
		}
	]
]);

export class ModerationActions {
	public guild: Guild;

	public constructor(guild: Guild) {
		this.guild = guild;
	}

	private get manageableChannelCount() {
		return this.guild.channels.reduce((acc, channel) => (channel.manageable ? acc + 1 : acc), 0);
	}

	public async warning(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Warning);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		return (await moderationLog.create())!;
	}

	public async unWarning(rawOptions: ModerationActionOptions, caseID: number, sendOptions?: ModerationActionsSendOptions) {
		const oldModerationLog = await this.guild.moderation.fetch(caseID);
		if (oldModerationLog === null || !oldModerationLog.isType(Moderation.TypeCodes.Warning))
			throw this.guild.language.tget('GUILD_WARN_NOT_FOUND');

		await oldModerationLog.invalidate();
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnWarn);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		return (await moderationLog.create())!;
	}

	public async setNickname(rawOptions: ModerationActionOptions, nickname: string, sendOptions?: ModerationActionsSendOptions) {
		const oldName = this.guild.memberTags.get(rawOptions.userID)?.nickname || '';
		const options = ModerationActions.fillOptions({ ...rawOptions, extraData: { oldName } }, Moderation.TypeCodes.SetNickname);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.members(rawOptions.userID)
			.patch({ data: { nick: nickname }, reason: this.guild.language.tget('ACTION_SET_NICKNAME', moderationLog.reason!, nickname) });

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.SetNickname);
		return (await moderationLog.create())!;
	}

	public async unSetNickname(rawOptions: ModerationActionOptions, nickname: string, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnSetNickname);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.members(rawOptions.userID)
			.patch({ data: { nick: nickname }, reason: rawOptions.reason });

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.SetNickname);
		return (await moderationLog.create())!;
	}

	public async addRole(rawOptions: ModerationActionOptions, role: Role, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions({ ...rawOptions, extraData: { role: role.id } }, Moderation.TypeCodes.AddRole);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.members(rawOptions.userID)
			.roles(role.id)
			.put({ reason: this.guild.language.tget('ACTION_ADD_ROLE', moderationLog.reason!) });

		await this.cancelLastLogTaskFromUser(
			options.userID,
			Moderation.TypeCodes.AddRole,
			(log) => (log.extraData as { role?: string })?.role === role.id
		);
		return (await moderationLog.create())!;
	}

	public async unAddRole(rawOptions: ModerationActionOptions, role: Role, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnAddRole);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api(this.guild.client).guilds(this.guild.id).members(rawOptions.userID).roles(role.id).delete({ reason: rawOptions.reason! });

		await this.cancelLastLogTaskFromUser(
			options.userID,
			Moderation.TypeCodes.AddRole,
			(log) => (log.extraData as { role?: string })?.role === role.id
		);
		return (await moderationLog.create())!;
	}

	public async removeRole(rawOptions: ModerationActionOptions, role: Role, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions({ ...rawOptions, extraData: { role: role.id } }, Moderation.TypeCodes.RemoveRole);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.members(rawOptions.userID)
			.roles(role.id)
			.delete({ reason: this.guild.language.tget('ACTION_REMOVE_ROLE', moderationLog.reason!) });

		await this.cancelLastLogTaskFromUser(
			options.userID,
			Moderation.TypeCodes.RemoveRole,
			(log) => (log.extraData as { role?: string })?.role === role.id
		);
		return (await moderationLog.create())!;
	}

	public async unRemoveRole(rawOptions: ModerationActionOptions, role: Role, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRemoveRole);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api(this.guild.client).guilds(this.guild.id).members(rawOptions.userID).roles(role.id).put({ reason: rawOptions.reason });

		await this.cancelLastLogTaskFromUser(
			options.userID,
			Moderation.TypeCodes.RemoveRole,
			(log) => (log.extraData as { role?: string })?.role === role.id
		);
		return (await moderationLog.create())!;
	}

	public async mute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyMute(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID);
		const extraData = await this.muteUser(rawOptions);
		const options = ModerationActions.fillOptions({ ...rawOptions, extraData }, Moderation.TypeCodes.Mute);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.Mute);
		return (await moderationLog.create())!;
	}

	public async unMute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnMute);
		await this.removeStickyMute(rawOptions.moderatorID || CLIENT_ID, options.userID);
		const oldModerationLog = await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.Mute);
		if (typeof oldModerationLog === 'undefined') throw this.guild.language.tget('MUTE_NOT_EXISTS');

		// If Skyra does not have permissions to manage permissions, abort.
		if (!(await this.fetchMe()).permissions.has(Permissions.FLAGS.MANAGE_ROLES)) throw this.guild.language.tget('MUTE_CANNOT_MANAGE_ROLES');

		await this.unmuteUser(options, oldModerationLog);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		return (await moderationLog.create())!;
	}

	public async kick(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Kick);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.members(options.userID)
			.delete({ reason: this.guild.language.tget('ACTION_KICK_REASON', moderationLog.reason!) });
		return (await moderationLog.create())!;
	}

	public async softBan(rawOptions: ModerationActionOptions, days: number, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Softban);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.bans(options.userID)
			.put({ query: { 'delete-message-days': days }, reason: this.guild.language.tget('ACTION_SOFTBAN_REASON', moderationLog.reason!) });
		await api(this.guild.client)
			.guilds(this.guild.id)
			.bans(options.userID)
			.delete({ reason: this.guild.language.tget('ACTION_UNSOFTBAN_REASON', moderationLog.reason!) });
		return (await moderationLog.create())!;
	}

	public async ban(rawOptions: ModerationActionOptions, days: number, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Ban);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.bans(options.userID)
			.put({ query: { 'delete-message-days': days }, reason: this.guild.language.tget('ACTION_BAN_REASON', moderationLog.reason!) });

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.Ban);
		return (await moderationLog.create())!;
	}

	public async unBan(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnBan);
		const moderationLog = this.guild.moderation.create(options);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.bans(options.userID)
			.delete({ reason: this.guild.language.tget('ACTION_UNBAN_REASON', moderationLog.reason!) });
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.Ban);
		return (await moderationLog.create())!;
	}

	public async voiceMute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.VoiceMute);
		const moderationLog = this.guild.moderation.create(options);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.members(options.userID)
			.patch({ data: { mute: true }, reason: this.guild.language.tget('ACTION_VMUTE_REASON', moderationLog.reason!) });
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.VoiceMute);
		return (await moderationLog.create())!;
	}

	public async unVoiceMute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnVoiceMute);
		const moderationLog = this.guild.moderation.create(options);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.members(options.userID)
			.patch({ data: { mute: false }, reason: this.guild.language.tget('ACTION_UNVMUTE_REASON', moderationLog.reason!) });
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.VoiceMute);
		return (await moderationLog.create())!;
	}

	public async voiceKick(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.VoiceKick);
		const moderationLog = this.guild.moderation.create(options);
		await api(this.guild.client)
			.guilds(this.guild.id)
			.members(options.userID)
			.patch({ data: { channel_id: null }, reason: this.guild.language.tget('ACTION_VKICK_REASON', moderationLog.reason!) });
		await this.sendDM(moderationLog, sendOptions);
		return (await moderationLog.create())!;
	}

	public async restrictAttachment(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedAttachment);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedAttachment);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionAttachment);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionAttachment);
		return (await moderationLog.create())!;
	}

	public async unRestrictAttachment(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedAttachment);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedAttachment);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionAttachment);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionAttachment);
		return (await moderationLog.create())!;
	}

	public async restrictReaction(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedReaction);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedReaction);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionReaction);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionReaction);
		return (await moderationLog.create())!;
	}

	public async unRestrictReaction(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedReaction);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedReaction);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionReaction);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionReaction);
		return (await moderationLog.create())!;
	}

	public async restrictEmbed(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedEmbed);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedEmbed);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionEmbed);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionEmbed);
		return (await moderationLog.create())!;
	}

	public async unRestrictEmbed(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedEmbed);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedEmbed);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionEmbed);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionEmbed);
		return (await moderationLog.create())!;
	}

	public async restrictEmoji(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedEmoji);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedEmoji);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionEmoji);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionEmoji);
		return (await moderationLog.create())!;
	}

	public async unRestrictEmoji(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedEmoji);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedEmoji);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionEmoji);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionEmoji);
		return (await moderationLog.create())!;
	}

	public async restrictVoice(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedVoice);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedVoice);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionVoice);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionVoice);
		return (await moderationLog.create())!;
	}

	public async unRestrictVoice(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.moderatorID || CLIENT_ID, rawOptions.userID, GuildSettings.Roles.RestrictedVoice);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedVoice);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionVoice);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionVoice);
		return (await moderationLog.create())!;
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

	public async userIsBanned(user: User) {
		try {
			await api(this.guild.client).guilds(this.guild.id).bans(user.id).get();
			return true;
		} catch (error) {
			if (!(error instanceof DiscordAPIError)) throw this.guild.language.tget('SYSTEM_FETCHBANS_FAIL');
			if (error.code === APIErrors.UnknownBan) return false;
			throw error;
		}
	}

	public userIsMuted(user: User) {
		const roleID = this.guild.settings.get(GuildSettings.Roles.Muted);
		return roleID !== null && this.guild.stickyRoles.get(user.id).includes(roleID);
	}

	public async userIsVoiceMuted(user: User) {
		try {
			const member = await this.guild.members.fetch(user.id);
			return member.voice.serverMute;
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === APIErrors.UnknownUser) {
				return false;
			}

			throw error;
		}
	}

	private async sharedRoleSetup(message: KlasaMessage, key: RoleDataKey, path: string) {
		const roleData = kRoleDataOptions.get(key)!;
		const role = await this.guild.roles.create({
			data: roleData,
			reason: `[Role Setup] Authorized by ${message.author.username} (${message.author.id}).`
		});
		await this.guild.settings.update(path, role, {
			extraContext: { author: message.author.id }
		});

		if (
			await message.ask(
				this.guild.language.tget('ACTION_SHARED_ROLE_SETUP', role.name, this.manageableChannelCount, this.displayPermissions(key))
			)
		) {
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

	private async sendDM(entry: ModerationEntity, sendOptions: ModerationActionsSendOptions = {}) {
		if (sendOptions.send) {
			try {
				const target = await entry.fetchUser();
				if (sendOptions.moderator) {
					await target
						.sendLocale('COMMAND_MODERATION_DM', [this.guild.name, entry.title, entry.reason, entry.duration, sendOptions.moderator])
						.catch(() => null);
				} else {
					await target
						.sendLocale('COMMAND_MODERATION_DM_ANONYMOUS', [this.guild.name, entry.title, entry.reason, entry.duration])
						.catch(() => null);
				}
			} catch (error) {
				if (error.code === APIErrors.CannotMessageUser) return;
				this.guild.client.emit(Events.Error, error);
			}
		}
	}

	private addStickyMute(moderatorID: string, id: string) {
		const mutedRole = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (mutedRole === null) return Promise.reject(this.guild.language.tget('MUTE_NOT_CONFIGURED'));
		return this.guild.stickyRoles.add(id, mutedRole, { author: moderatorID });
	}

	private removeStickyMute(moderatorID: string, id: string) {
		const mutedRole = this.guild.settings.get(GuildSettings.Roles.Muted);
		if (mutedRole === null) return Promise.reject(this.guild.language.tget('MUTE_NOT_CONFIGURED'));
		return this.guild.stickyRoles.remove(id, mutedRole, { author: moderatorID });
	}

	private async muteUser(rawOptions: ModerationActionOptions) {
		try {
			const member = await this.guild.members.fetch(rawOptions.userID);
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
			await this.guild.settings.reset(GuildSettings.Roles.Muted);
			throw this.guild.language.tget('MUTE_NOT_CONFIGURED');
		}

		const { position } = (await this.fetchMe()).roles.highest;
		const extracted = ModerationActions.muteExtractRoles(member, position);
		extracted.keepRoles.push(roleID);

		await member.edit({ roles: extracted.keepRoles }, reason);
		return extracted.removedRoles;
	}

	private async unmuteUser(options: ModerationManagerCreateData & { reason: string | null }, moderationLog: ModerationEntity | null) {
		try {
			const member = await this.guild.members.fetch(options.userID);
			return moderationLog === null
				? this.unmuteUserInGuildWithoutData(member, this.guild.language.tget('ACTION_UNMUTE_REASON', options.reason))
				: this.unmuteUserInGuildWithData(member, this.guild.language.tget('ACTION_UNMUTE_REASON', options.reason), moderationLog);
		} catch (error) {
			if (error.code !== APIErrors.UnknownMember) throw error;
		}
	}

	/**
	 * Unmute a user who is in a guild and has a running moderation log.
	 * @since 5.3.0
	 * @param member The member to unmute
	 * @param reason The reason to send for audit logs when unmuting
	 * @param moderationLog The moderation manager that defined the formal mute
	 */
	private async unmuteUserInGuildWithData(member: GuildMember, reason: string, moderationLog: ModerationEntity) {
		const roleID = this.guild.settings.get(GuildSettings.Roles.Muted);
		const { position } = (await this.fetchMe()).roles.highest;
		const rawRoleIDs = Array.isArray(moderationLog.extraData) ? (moderationLog.extraData as string[]) : [];
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
			await this.guild.settings.reset(GuildSettings.Roles.Muted);
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

	private addStickyRestriction(moderatorID: string, id: string, roleID: string) {
		const restrictedRole = this.guild.settings.get(roleID) as string | null;
		if (restrictedRole === null) return Promise.reject(this.guild.language.tget('RESTRICTION_NOT_CONFIGURED'));
		return this.guild.stickyRoles.add(id, restrictedRole, { author: moderatorID });
	}

	private async addRestrictionRole(id: string, key: string) {
		const roleID = this.guild.settings.get(key) as string | null;
		if (roleID === null) throw this.guild.language.tget('RESTRICTION_NOT_CONFIGURED');
		await api(this.guild.client).guilds(this.guild.id).members(id).roles(roleID).put();
	}

	private removeStickyRestriction(moderatorID: string, id: string, roleID: string) {
		const restrictedRole = this.guild.settings.get(roleID) as string | null;
		if (restrictedRole === null) return Promise.reject(this.guild.language.tget('RESTRICTION_NOT_CONFIGURED'));
		return this.guild.stickyRoles.remove(id, restrictedRole, { author: moderatorID });
	}

	private async removeRestrictionRole(id: string, key: string) {
		const roleID = this.guild.settings.get(key) as string | null;
		if (roleID === null) throw this.guild.language.tget('RESTRICTION_NOT_CONFIGURED');
		try {
			await api(this.guild.client).guilds(this.guild.id).members(id).roles(roleID).delete();
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

	/**
	 * Deletes the task from the last log from a user's cases
	 * @param userID The user ID to use when fetching
	 * @param type The type to retrieve for the invalidation
	 */
	private async cancelLastLogTaskFromUser(userID: string, type: Moderation.TypeCodes, extra?: (log: ModerationEntity) => boolean) {
		const log = await this.retrieveLastLogFromUser(userID, type, extra);
		if (!log) return null;

		const { task } = log;
		if (task && !task.running) await task.delete();
		return log;
	}

	private async retrieveLastLogFromUser(userID: string, type: Moderation.TypeCodes, extra: (log: ModerationEntity) => boolean = () => true) {
		// Retrieve all moderation logs regarding a user.
		const logs = await this.guild.moderation.fetch(userID);

		// Filter all logs by valid and by type of mute (isType will include temporary and invisible).
		return logs.filter((log) => !log.invalidated && log.isType(type) && extra(log)).lastValue;
	}

	private static getRoleDataKeyFromSchemaKey(key: ModerationSetupRestriction): RoleDataKey {
		switch (key) {
			case ModerationSetupRestriction.Attachment:
				return RoleDataKey.Attachment;
			case ModerationSetupRestriction.Embed:
				return RoleDataKey.Embed;
			case ModerationSetupRestriction.Emoji:
				return RoleDataKey.Emoji;
			case ModerationSetupRestriction.Reaction:
				return RoleDataKey.Reaction;
			case ModerationSetupRestriction.Voice:
				return RoleDataKey.Voice;
		}
	}

	private static fillOptions(rawOptions: ModerationActionOptions, type: Moderation.TypeCodes) {
		const options = { reason: null, ...rawOptions, type };
		if (typeof options.reason === 'undefined') options.reason = null;
		if (typeof options.moderatorID === 'undefined') options.moderatorID = CLIENT_ID;
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
			const allowed = current.allow.toArray().map((permission) => [permission, true]);
			const denied = current.allow.toArray().map((permission) => [permission, false]);
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
