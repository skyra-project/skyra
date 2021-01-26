import { GuildEntity, GuildSettings, ModerationEntity } from '#lib/database';
import { api } from '#lib/discord/Api';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { ModerationManagerCreateData } from '#lib/moderation';
import type { KeyOfType } from '#lib/types';
import { CLIENT_ID } from '#root/config';
import { Moderation } from '#utils/constants';
import { resolveOnErrorCodes } from '#utils/util';
import { isNullish, Nullish } from '@sapphire/utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import {
	DiscordAPIError,
	Guild,
	GuildChannel,
	GuildMember,
	Message,
	MessageEmbed,
	PermissionOverwriteOption,
	Permissions,
	Role,
	RoleData,
	User
} from 'discord.js';
import type { TFunction } from 'i18next';

export const enum ModerationSetupRestriction {
	All = 'rolesMuted',
	Reaction = 'rolesRestrictedReaction',
	Embed = 'rolesRestrictedEmbed',
	Emoji = 'rolesRestrictedEmoji',
	Attachment = 'rolesRestrictedAttachment',
	Voice = 'rolesRestrictedVoice'
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

export interface ModerationAction {
	addRole: string;
	mute: string;
	ban: string;
	kick: string;
	softban: string;
	vkick: string;
	vmute: string;
	restrictedReact: string;
	restrictedEmbed: string;
	restrictedAttachment: string;
	restrictedVoice: string;
	setNickname: string;
	removeRole: string;
}

export class ModerationActions {
	public guild: Guild;

	public constructor(guild: Guild) {
		this.guild = guild;
	}

	private get manageableChannelCount() {
		return this.guild.channels.cache.reduce((acc, channel) => (channel.manageable ? acc + 1 : acc), 0);
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
			throw await this.guild.resolveKey(LanguageKeys.Commands.Moderation.GuildWarnNotFound);

		await oldModerationLog.invalidate();
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnWarn);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		return (await moderationLog.create())!;
	}

	public async setNickname(rawOptions: ModerationActionOptions, nickname: string, sendOptions?: ModerationActionsSendOptions) {
		const oldName = this.guild.members.cache.get(rawOptions.userID)?.nickname || '';
		const options = ModerationActions.fillOptions({ ...rawOptions, extraData: { oldName } }, Moderation.TypeCodes.SetNickname);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api()
			.guilds(this.guild.id)
			.members(rawOptions.userID)
			.patch({
				data: { nick: nickname },
				reason: moderationLog.reason
					? await this.guild.resolveKey(
							nickname
								? LanguageKeys.Commands.Moderation.ActionSetNicknameSet
								: LanguageKeys.Commands.Moderation.ActionSetNicknameRemoved,
							{ reason: moderationLog.reason }
					  )
					: await this.guild.resolveKey(
							nickname
								? LanguageKeys.Commands.Moderation.ActionSetNicknameNoReasonSet
								: LanguageKeys.Commands.Moderation.ActionSetNicknameNoReasonRemoved
					  )
			});

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.SetNickname);
		return (await moderationLog.create())!;
	}

	public async unSetNickname(rawOptions: ModerationActionOptions, nickname: string, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnSetNickname);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api()
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
		await api()
			.guilds(this.guild.id)
			.members(rawOptions.userID)
			.roles(role.id)
			.put({
				reason: await this.getReason('addRole', moderationLog.reason)
			});

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
		await api().guilds(this.guild.id).members(rawOptions.userID).roles(role.id).delete({ reason: rawOptions.reason! });

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
		await api()
			.guilds(this.guild.id)
			.members(rawOptions.userID)
			.roles(role.id)
			.delete({ reason: await this.getReason('removeRole', moderationLog.reason) });

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
		await api().guilds(this.guild.id).members(rawOptions.userID).roles(role.id).put({ reason: rawOptions.reason });

		await this.cancelLastLogTaskFromUser(
			options.userID,
			Moderation.TypeCodes.RemoveRole,
			(log) => (log.extraData as { role?: string })?.role === role.id
		);
		return (await moderationLog.create())!;
	}

	public async mute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyMute(rawOptions.userID);
		const extraData = await this.muteUser(rawOptions);
		const options = ModerationActions.fillOptions({ ...rawOptions, extraData }, Moderation.TypeCodes.Mute);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.Mute);
		return (await moderationLog.create())!;
	}

	public async unMute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnMute);
		await this.removeStickyMute(options.userID);
		const oldModerationLog = await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.Mute);
		if (typeof oldModerationLog === 'undefined') {
			throw await this.guild.resolveKey(LanguageKeys.Commands.Moderation.MuteNotExists);
		}

		// If Skyra does not have permissions to manage permissions, abort.
		if (!(await this.fetchMe()).permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
			throw await this.guild.resolveKey(LanguageKeys.Commands.Moderation.MuteCannotManageRoles);
		}

		await this.unmuteUser(options, oldModerationLog);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		return (await moderationLog.create())!;
	}

	public async kick(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Kick);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api()
			.guilds(this.guild.id)
			.members(options.userID)
			.delete({
				reason: await this.getReason('kick', moderationLog.reason)
			});
		return (await moderationLog.create())!;
	}

	public async softBan(rawOptions: ModerationActionOptions, days: number, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.SoftBan);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		const t = await this.guild.fetchT();
		await api()
			.guilds(this.guild.id)
			.bans(options.userID)
			.put({
				query: { 'delete-message-days': days },
				reason: moderationLog.reason
					? t(LanguageKeys.Commands.Moderation.ActionSoftBanReason, { reason: moderationLog.reason! })
					: t(LanguageKeys.Commands.Moderation.ActionSoftBanNoReason)
			});
		await api()
			.guilds(this.guild.id)
			.bans(options.userID)
			.delete({
				reason: moderationLog.reason
					? t(LanguageKeys.Commands.Moderation.ActionUnSoftBanReason, { reason: moderationLog.reason! })
					: t(LanguageKeys.Commands.Moderation.ActionUnSoftBanNoReason)
			});
		return (await moderationLog.create())!;
	}

	public async ban(rawOptions: ModerationActionOptions, days: number, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.Ban);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);
		await api()
			.guilds(this.guild.id)
			.bans(options.userID)
			.put({
				query: { 'delete-message-days': days },
				reason: await this.getReason('ban', moderationLog.reason)
			});

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.Ban);
		return (await moderationLog.create())!;
	}

	public async unBan(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnBan);
		const moderationLog = this.guild.moderation.create(options);
		await api()
			.guilds(this.guild.id)
			.bans(options.userID)
			.delete({ reason: await this.getReason('ban', moderationLog.reason, true) });
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.Ban);
		return (await moderationLog.create())!;
	}

	public async voiceMute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.VoiceMute);
		const moderationLog = this.guild.moderation.create(options);
		await api()
			.guilds(this.guild.id)
			.members(options.userID)
			.patch({ data: { mute: true }, reason: await this.getReason('vmute', moderationLog.reason) });
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.VoiceMute);
		return (await moderationLog.create())!;
	}

	public async unVoiceMute(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnVoiceMute);
		const moderationLog = this.guild.moderation.create(options);
		await api()
			.guilds(this.guild.id)
			.members(options.userID)
			.patch({ data: { mute: false }, reason: await this.getReason('vmute', moderationLog.reason, true) });
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.VoiceMute);
		return (await moderationLog.create())!;
	}

	public async voiceKick(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.VoiceKick);
		const moderationLog = this.guild.moderation.create(options);
		await api()
			.guilds(this.guild.id)
			.members(options.userID)
			.patch({ data: { channel_id: null }, reason: await this.getReason('vkick', moderationLog.reason) });
		await this.sendDM(moderationLog, sendOptions);
		return (await moderationLog.create())!;
	}

	public async restrictAttachment(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedAttachment);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedAttachment);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionAttachment);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionAttachment);
		return (await moderationLog.create())!;
	}

	public async unRestrictAttachment(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedAttachment);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedAttachment);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionAttachment);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionAttachment);
		return (await moderationLog.create())!;
	}

	public async restrictReaction(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedReaction);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedReaction);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionReaction);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionReaction);
		return (await moderationLog.create())!;
	}

	public async unRestrictReaction(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedReaction);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedReaction);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionReaction);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionReaction);
		return (await moderationLog.create())!;
	}

	public async restrictEmbed(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedEmbed);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedEmbed);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionEmbed);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionEmbed);
		return (await moderationLog.create())!;
	}

	public async unRestrictEmbed(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedEmbed);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedEmbed);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionEmbed);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionEmbed);
		return (await moderationLog.create())!;
	}

	public async restrictEmoji(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedEmoji);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedEmoji);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionEmoji);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionEmoji);
		return (await moderationLog.create())!;
	}

	public async unRestrictEmoji(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedEmoji);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedEmoji);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionEmoji);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionEmoji);
		return (await moderationLog.create())!;
	}

	public async restrictVoice(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.addStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedVoice);
		await this.addRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedVoice);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.RestrictionVoice);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionVoice);
		return (await moderationLog.create())!;
	}

	public async unRestrictVoice(rawOptions: ModerationActionOptions, sendOptions?: ModerationActionsSendOptions) {
		await this.removeStickyRestriction(rawOptions.userID, GuildSettings.Roles.RestrictedVoice);
		await this.removeRestrictionRole(rawOptions.userID, GuildSettings.Roles.RestrictedVoice);
		const options = ModerationActions.fillOptions(rawOptions, Moderation.TypeCodes.UnRestrictionVoice);
		const moderationLog = this.guild.moderation.create(options);
		await this.sendDM(moderationLog, sendOptions);

		await this.cancelLastLogTaskFromUser(options.userID, Moderation.TypeCodes.RestrictionVoice);
		return (await moderationLog.create())!;
	}

	public async muteSetup(message: Message) {
		const [roleID, t] = await this.guild.readSettings((settings) => [settings[GuildSettings.Roles.Muted], settings.getLanguage()]);
		if (roleID && this.guild.roles.cache.has(roleID)) throw t(LanguageKeys.Commands.Moderation.ActionSetupMuteExists);
		if (this.guild.roles.cache.size >= 250) throw t(LanguageKeys.Commands.Moderation.ActionSetupTooManyRoles);

		// Set up the shared role setup
		return this.sharedRoleSetup(message, RoleDataKey.Muted, GuildSettings.Roles.Muted);
	}

	public async restrictionSetup(message: Message, path: ModerationSetupRestriction) {
		const [roleID, t] = await this.guild.readSettings((settings) => [settings[path], settings.getLanguage()]);
		if (!isNullish(roleID) && this.guild.roles.cache.has(roleID)) {
			throw t(LanguageKeys.Commands.Moderation.ActionSetupRestrictionExists);
		}
		if (this.guild.roles.cache.size >= 250) throw t(LanguageKeys.Commands.Moderation.ActionSetupTooManyRoles);

		// Set up the shared role setup
		return this.sharedRoleSetup(message, ModerationActions.getRoleDataKeyFromSchemaKey(path), path);
	}

	public async userIsBanned(user: User) {
		try {
			await api().guilds(this.guild.id).bans(user.id).get();
			return true;
		} catch (error) {
			if (!(error instanceof DiscordAPIError)) throw await this.guild.resolveKey(LanguageKeys.System.FetchBansFail);
			if (error.code === RESTJSONErrorCodes.UnknownBan) return false;
			throw error;
		}
	}

	public async userIsMuted(user: User) {
		const roleID = await this.guild.readSettings(GuildSettings.Roles.Muted);
		if (isNullish(roleID)) return false;
		return this.guild.stickyRoles.has(user.id, roleID);
	}

	public async userIsVoiceMuted(user: User) {
		const member = await resolveOnErrorCodes(this.guild.members.fetch(user.id), RESTJSONErrorCodes.UnknownUser);
		return member?.voice.serverMute ?? false;
	}

	private async sharedRoleSetup(message: Message, key: RoleDataKey, path: KeyOfType<GuildEntity, string | Nullish>) {
		const roleData = kRoleDataOptions.get(key)!;
		const role = await this.guild.roles.create({
			data: roleData,
			reason: `[Role Setup] Authorized by ${message.author.username} (${message.author.id}).`
		});
		const t = await this.guild.writeSettings((settings) => {
			settings[path] = role.id;
			return settings.getLanguage();
		});

		if (
			await message.ask(
				t(LanguageKeys.Commands.Moderation.ActionSharedRoleSetupAsk, {
					role: role.name,
					channels: this.manageableChannelCount,
					permissions: this.displayPermissions(t, key).map((permission) => `\`${permission}\``)
				})
			)
		) {
			await this.updatePermissionsForCategoryChannels(role, key);
			await this.updatePermissionsForTextOrVoiceChannels(role, key);
		}
	}

	private displayPermissions(t: TFunction, key: RoleDataKey) {
		const options = kRoleChannelOverwriteOptions.get(key)!;
		const output: string[] = [];
		for (const keyOption of Object.keys(options.category.options)) {
			output.push(t(`permissions:${keyOption}`, keyOption));
		}
		return output;
	}

	private async fetchMe() {
		return this.guild.members.fetch(CLIENT_ID);
	}

	private async sendDM(entry: ModerationEntity, sendOptions: ModerationActionsSendOptions = {}) {
		if (sendOptions.send) {
			try {
				const target = await entry.fetchUser();
				const embed = await this.buildEmbed(entry, sendOptions);
				await resolveOnErrorCodes(target.send(embed), RESTJSONErrorCodes.CannotSendMessagesToThisUser);
			} catch (error) {
				this.guild.client.logger.error(error);
			}
		}
	}

	private async buildEmbed(entry: ModerationEntity, sendOptions: ModerationActionsSendOptions) {
		const descriptionKey = entry.reason
			? entry.duration
				? LanguageKeys.Commands.Moderation.ModerationDmDescriptionWithReasonWithDuration
				: LanguageKeys.Commands.Moderation.ModerationDmDescriptionWithReason
			: entry.duration
			? LanguageKeys.Commands.Moderation.ModerationDmDescriptionWithDuration
			: LanguageKeys.Commands.Moderation.ModerationDmDescription;

		const t = await this.guild.fetchT();
		const description = t(descriptionKey, {
			guild: this.guild.name,
			title: entry.title,
			reason: entry.reason,
			duration: entry.duration
		});
		const embed = new MessageEmbed().setDescription(description).setFooter(t(LanguageKeys.Commands.Moderation.ModerationDmFooter));

		if (sendOptions.moderator) {
			embed.setAuthor(sendOptions.moderator.username, sendOptions.moderator.displayAvatarURL({ size: 128, format: 'png', dynamic: true }));
		}

		return embed;
	}

	private async addStickyMute(id: string) {
		const [roleID, t] = await this.guild.readSettings((settings) => [settings.rolesMuted, settings.getLanguage()]);
		if (isNullish(roleID)) throw t(LanguageKeys.Commands.Moderation.MuteNotConfigured);
		return this.guild.stickyRoles.add(id, roleID);
	}

	private async removeStickyMute(id: string) {
		const [roleID, t] = await this.guild.readSettings((settings) => [settings.rolesMuted, settings.getLanguage()]);
		if (isNullish(roleID)) throw t(LanguageKeys.Commands.Moderation.MuteNotConfigured);
		return this.guild.stickyRoles.remove(id, roleID);
	}

	private async muteUser(rawOptions: ModerationActionOptions) {
		try {
			const member = await this.guild.members.fetch(rawOptions.userID);
			return this.muteUserInGuild(member, await this.getReason('mute', rawOptions.reason || null));
		} catch (error) {
			if (error.code === RESTJSONErrorCodes.UnknownMember)
				throw await this.guild.resolveKey(LanguageKeys.Commands.Moderation.ActionRequiredMember);
			throw error;
		}
	}

	private async muteUserInGuild(member: GuildMember, reason: string) {
		const [roleID, t] = await this.guild.readSettings((settings) => [settings.rolesMuted, settings.getLanguage()]);
		if (isNullish(roleID)) throw t(LanguageKeys.Commands.Moderation.MuteNotConfigured);

		const role = this.guild.roles.cache.get(roleID);
		if (typeof role === 'undefined') {
			await this.guild.writeSettings([[GuildSettings.Roles.Muted, null]]);
			throw t(LanguageKeys.Commands.Moderation.MuteNotConfigured);
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
				? this.unmuteUserInGuildWithoutData(member, await this.getReason('mute', options.reason, true))
				: this.unmuteUserInGuildWithData(member, await this.getReason('mute', options.reason, true), moderationLog);
		} catch (error) {
			if (error.code !== RESTJSONErrorCodes.UnknownMember) throw error;
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
		const roleID = await this.guild.readSettings(GuildSettings.Roles.Muted);
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
		const [roleID, t] = await this.guild.readSettings((settings) => [settings.rolesMuted, settings.getLanguage()]);
		if (isNullish(roleID)) throw t(LanguageKeys.Commands.Moderation.MuteNotConfigured);

		// Retrieve the role instance from the role ID, reset and return false if it does not exist.
		const role = this.guild.roles.cache.get(roleID);
		if (typeof role === 'undefined') {
			await this.guild.writeSettings([[GuildSettings.Roles.Muted, null]]);
			throw t(LanguageKeys.Commands.Moderation.MuteNotConfigured);
		}

		// If the user has the role, begin processing the data.
		if (member.roles.cache.has(roleID)) {
			// Fetch self and check if the bot has enough role hierarchy to manage the role, return false when not.
			const { position } = (await this.fetchMe()).roles.highest;
			if (role.position >= position) throw t(LanguageKeys.Commands.Moderation.MuteLowHierarchy);

			// Remove the role from the member.
			await member.roles.remove(roleID, reason);
			return;
		}

		throw t(LanguageKeys.Commands.Moderation.MuteNotInMember);
	}

	private unmuteExtractRoles(member: GuildMember, roleID: string | Nullish, selfPosition: number, rawIdentifiers: readonly string[] | null) {
		if (rawIdentifiers === null) rawIdentifiers = [];

		const rawRoles: Role[] = [];
		for (const id of rawIdentifiers) {
			const role = this.guild.roles.cache.get(id);
			if (typeof role !== 'undefined') rawRoles.push(role);
		}

		const roles = new Set<string>(member.roles.cache.keys());
		for (const rawRole of rawRoles) {
			if (rawRole.position < selfPosition) roles.add(rawRole.id);
		}

		if (!isNullish(roleID)) roles.delete(roleID);

		return [...roles];
	}

	private async addStickyRestriction(id: string, key: KeyOfType<GuildEntity, string | Nullish>) {
		const [roleID, t] = await this.guild.readSettings((settings) => [settings[key], settings.getLanguage()]);
		if (isNullish(roleID)) throw t(LanguageKeys.Misc.RestrictionNotConfigured);
		return this.guild.stickyRoles.add(id, roleID);
	}

	private async addRestrictionRole(id: string, key: KeyOfType<GuildEntity, string | Nullish>) {
		const [roleID, t] = await this.guild.readSettings((settings) => [settings[key], settings.getLanguage()]);
		if (isNullish(roleID)) throw t(LanguageKeys.Misc.RestrictionNotConfigured);
		await api().guilds(this.guild.id).members(id).roles(roleID).put();
	}

	private async removeStickyRestriction(id: string, key: KeyOfType<GuildEntity, string | Nullish>) {
		const [roleID, t] = await this.guild.readSettings((settings) => [settings[key], settings.getLanguage()]);
		if (isNullish(roleID)) throw t(LanguageKeys.Misc.RestrictionNotConfigured);
		return this.guild.stickyRoles.remove(id, roleID);
	}

	private async removeRestrictionRole(id: string, key: KeyOfType<GuildEntity, string | Nullish>) {
		const [roleID, t] = await this.guild.readSettings((settings) => [settings[key], settings.getLanguage()]);
		if (isNullish(roleID)) throw t(LanguageKeys.Misc.RestrictionNotConfigured);
		try {
			await api().guilds(this.guild.id).members(id).roles(roleID).delete();
		} catch (error) {
			if (error.code !== RESTJSONErrorCodes.UnknownMember) throw error;
		}
	}

	private async updatePermissionsForCategoryChannels(role: Role, dataKey: RoleDataKey) {
		const options = kRoleChannelOverwriteOptions.get(dataKey)!;
		const promises: Promise<unknown>[] = [];
		for (const channel of this.guild.channels.cache.values()) {
			if (channel.type === 'category' && channel.manageable) {
				promises.push(ModerationActions.updatePermissionsForChannel(role, channel, options.category));
			}
		}

		await Promise.all(promises);
	}

	private async updatePermissionsForTextOrVoiceChannels(role: Role, dataKey: RoleDataKey) {
		const options = kRoleChannelOverwriteOptions.get(dataKey)!;
		const promises: Promise<unknown>[] = [];
		for (const channel of this.guild.channels.cache.values()) {
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

	private async getReason(action: keyof ModerationAction, reason: string | null, revoke = false) {
		const t = await this.guild.fetchT();
		const actions = t(LanguageKeys.Commands.Moderation.Actions);
		if (!reason)
			return revoke
				? t(LanguageKeys.Commands.Moderation.ActionRevokeNoReason, { action: actions[action] })
				: t(LanguageKeys.Commands.Moderation.ActionApplyNoReason, { action: actions[action] });
		return revoke
			? t(LanguageKeys.Commands.Moderation.ActionRevokeReason, { action: actions[action], reason })
			: t(LanguageKeys.Commands.Moderation.ActionApplyReason, { action: actions[action], reason });
	}

	private async retrieveLastLogFromUser(userID: string, type: Moderation.TypeCodes, extra: (log: ModerationEntity) => boolean = () => true) {
		// Retrieve all moderation logs regarding a user.
		const logs = await this.guild.moderation.fetch(userID);

		// Filter all logs by valid and by type of mute (isType will include temporary and invisible).
		return logs.filter((log) => !log.invalidated && log.isType(type) && extra(log)).last();
	}

	private static getRoleDataKeyFromSchemaKey(key: ModerationSetupRestriction): RoleDataKey {
		switch (key) {
			case ModerationSetupRestriction.All:
				return RoleDataKey.Muted;
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
		for (const [id, role] of member.roles.cache.entries()) {
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
