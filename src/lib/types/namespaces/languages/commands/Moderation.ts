import { FT, T } from '#lib/types';
import { Moderation } from '#utils/constants';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';
import { User } from 'discord.js';

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

export const HistoryDescription = T<string>('commands/moderation:historyDescription');
export const HistoryExtended = T<LanguageHelpDisplayOptions>('commands/moderation:historyExtended');
export const HistoryFooterNew = FT<
	{
		warnings: number;
		mutes: number;
		kicks: number;
		bans: number;
		warningsText: string;
		mutesText: string;
		kicksText: string;
		bansText: string;
	},
	string
>('commands/moderation:historyFooterNew');
export const HistoryFooterWarning = FT<{ count: number }, string>('commands/moderation:historyFooterWarning');
export const HistoryFooterMutes = FT<{ count: number }, string>('commands/moderation:historyFooterMutes');
export const HistoryFooterKicks = FT<{ count: number }, string>('commands/moderation:historyFooterKicks');
export const HistoryFooterBans = FT<{ count: number }, string>('commands/moderation:historyFooterBans');
export const ModerationsDescription = T<string>('commands/moderation:moderationsDescription');
export const ModerationsExtended = T<LanguageHelpDisplayOptions>('commands/moderation:moderationsExtended');
export const ModerationsEmpty = T<string>('commands/moderation:moderationsEmpty');
export const ModerationsAmount = FT<{ count: number }, string>('commands/moderation:moderationsAmount');
export const MutesDescription = T<string>('commands/moderation:mutesDescription');
export const MutesExtended = T<LanguageHelpDisplayOptions>('commands/moderation:mutesExtended');
export const WarningsDescription = T<string>('commands/moderation:warningsDescription');
export const WarningsExtended = T<LanguageHelpDisplayOptions>('commands/moderation:warningsExtended');
export const MuteDescription = T<string>('commands/moderation:muteDescription');
export const MuteExtended = T<LanguageHelpDisplayOptions>('commands/moderation:muteExtended');
export const PruneDescription = T<string>('commands/moderation:pruneDescription');
export const PruneExtended = T<LanguageHelpDisplayOptions>('commands/moderation:pruneExtended');
export const CaseDescription = T<string>('commands/moderation:caseDescription');
export const CaseExtended = T<LanguageHelpDisplayOptions>('commands/moderation:caseExtended');
export const PermissionsDescription = T<string>('commands/moderation:permissionsDescription');
export const PermissionsExtended = T<LanguageHelpDisplayOptions>('commands/moderation:permissionsExtended');
export const FlowDescription = T<string>('commands/moderation:flowDescription');
export const FlowExtended = T<LanguageHelpDisplayOptions>('commands/moderation:flowExtended');
export const ReasonDescription = T<string>('commands/moderation:reasonDescription');
export const ReasonExtended = T<LanguageHelpDisplayOptions>('commands/moderation:reasonExtended');
export const RestrictAttachmentDescription = T<string>('commands/moderation:restrictAttachmentDescription');
export const RestrictAttachmentExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictAttachmentExtended');
export const RestrictEmbedDescription = T<string>('commands/moderation:restrictEmbedDescription');
export const RestrictEmbedExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictEmbedExtended');
export const RestrictEmojiDescription = T<string>('commands/moderation:restrictEmojiDescription');
export const RestrictEmojiExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictEmojiExtended');
export const RestrictReactionDescription = T<string>('commands/moderation:restrictReactionDescription');
export const RestrictReactionExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictReactionExtended');
export const RestrictVoiceDescription = T<string>('commands/moderation:restrictVoiceDescription');
export const RestrictVoiceExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictVoiceExtended');
export const SoftBanDescription = T<string>('commands/moderation:softBanDescription');
export const SoftBanExtended = T<LanguageHelpDisplayOptions>('commands/moderation:softBanExtended');
export const ToggleModerationDmDescription = T<string>('commands/moderation:toggleModerationDmDescription');
export const ToggleModerationDmExtended = T<LanguageHelpDisplayOptions>('commands/moderation:toggleModerationDmExtended');
export const UnbanDescription = T<string>('commands/moderation:unbanDescription');
export const UnbanExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unbanExtended');
export const UnmuteDescription = T<string>('commands/moderation:unmuteDescription');
export const UnmuteExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unmuteExtended');
export const UnrestrictAttachmentDescription = T<string>('commands/moderation:unrestrictAttachmentDescription');
export const UnrestrictAttachmentExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictAttachmentExtended');
export const UnrestrictEmbedDescription = T<string>('commands/moderation:unrestrictEmbedDescription');
export const UnrestrictEmbedExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictEmbedExtended');
export const UnrestrictEmojiDescription = T<string>('commands/moderation:unrestrictEmojiDescription');
export const UnrestrictEmojiExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictEmojiExtended');
export const UnrestrictReactionDescription = T<string>('commands/moderation:unrestrictReactionDescription');
export const UnrestrictReactionExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictReactionExtended');
export const UnrestrictVoiceDescription = T<string>('commands/moderation:unrestrictVoiceDescription');
export const UnrestrictVoiceExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictVoiceExtended');
export const UnwarnDescription = T<string>('commands/moderation:unwarnDescription');
export const UnwarnExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unwarnExtended');
export const VmuteDescription = T<string>('commands/moderation:vmuteDescription');
export const VmuteExtended = T<LanguageHelpDisplayOptions>('commands/moderation:vmuteExtended');
export const VoiceKickDescription = T<string>('commands/moderation:voiceKickDescription');
export const VoiceKickExtended = T<LanguageHelpDisplayOptions>('commands/moderation:voiceKickExtended');
export const VunmuteDescription = T<string>('commands/moderation:vunmuteDescription');
export const VunmuteExtended = T<LanguageHelpDisplayOptions>('commands/moderation:vunmuteExtended');
export const WarnDescription = T<string>('commands/moderation:warnDescription');
export const WarnExtended = T<LanguageHelpDisplayOptions>('commands/moderation:warnExtended');
export const Flow = FT<{ amount: number }, string>('commands/moderation:flow');
export const TimeTimed = T<string>('commands/moderation:timeTimed');
export const TimeUndefinedTime = T<string>('commands/moderation:timeUndefinedTime');
export const TimeUnsupportedType = T<string>('commands/moderation:timeUnsupportedType');
export const TimeNotScheduled = T<string>('commands/moderation:timeNotScheduled');
export const TimeAborted = FT<{ title: string }, string>('commands/moderation:timeAborted');
export const TimeScheduled = FT<{ title: string; user: User; time: number }, string>('commands/moderation:timeScheduled');
export const SlowmodeSet = FT<{ cooldown: number }, string>('commands/moderation:slowmodeSet');
export const SlowmodeReset = T<string>('commands/moderation:slowmodeReset');
export const SlowmodeTooLong = T<string>('commands/moderation:slowmodeTooLong');
export const TimeDescription = T<string>('commands/moderation:timeDescription');
export const TimeExtended = T<LanguageHelpDisplayOptions>('commands/moderation:timeExtended');
export const BanNotBannable = T<string>('commands/moderation:banNotBannable');
export const DehoistStarting = FT<{ count: number }, string>('commands/moderation:dehoistStarting');
export const DehoistProgress = FT<{ count: number; percentage: number }, string>('commands/moderation:dehoistProgress');
export const DehoistEmbed = FT<
	{
		users: number;
		dehoistedMemberCount: number;
		dehoistedWithErrorsCount: number;
		errored: number;
	},
	{
		title: string;
		descriptionNoone: string;
		descriptionWithError: string;
		descriptionWithMultipleErrors: string;
		description: string;
		descriptionMultipleMembers: string;
		fieldErrorTitle: string;
	}
>('commands/moderation:dehoistEmbed');
export const KickNotKickable = T<string>('commands/moderation:kickNotKickable');
export const LockdownLock = FT<{ channel: string }, string>('commands/moderation:lockdownLock');
export const LockdownLocking = FT<{ channel: string }, string>('commands/moderation:lockdownLocking');
export const LockdownLocked = FT<{ channel: string }, string>('commands/moderation:lockdownLocked');
export const LockdownUnlocked = FT<{ channel: string }, string>('commands/moderation:lockdownUnlocked');
export const LockdownOpen = FT<{ channel: string }, string>('commands/moderation:lockdownOpen');
export const MuteLowlevel = T<string>('commands/moderation:muteLowlevel');
export const MuteConfigureCancelled = T<string>('commands/moderation:muteConfigureCancelled');
export const MuteConfigure = T<string>('commands/moderation:muteConfigure');
export const MuteConfigureToomanyRoles = T<string>('commands/moderation:muteConfigureToomanyRoles');
export const MuteMuted = T<string>('commands/moderation:muteMuted');
export const MuteUserNotMuted = T<string>('commands/moderation:muteUserNotMuted');
export const MuteUnconfigured = T<string>('commands/moderation:muteUnconfigured');
export const MutecreateMissingPermission = T<string>('commands/moderation:mutecreateMissingPermission');
export const RestrictLowlevel = T<string>('commands/moderation:restrictLowlevel');
export const PruneInvalid = T<string>('commands/moderation:pruneInvalid');
export const PruneAlert = FT<{ count: number; total: number }, string>('commands/moderation:pruneAlert');
export const PruneInvalidPosition = T<string>('commands/moderation:pruneInvalidPosition');
export const PruneInvalidFilter = T<string>('commands/moderation:pruneInvalidFilter');
export const PruneNoDeletes = T<string>('commands/moderation:pruneNoDeletes');
export const PruneLogHeader = T<string>('commands/moderation:pruneLogHeader');
export const PruneLogMessage = FT<{ channel: string; author: string; count: number }, string>('commands/moderation:pruneLogMessage');
export const ReasonMissingCase = T<string>('commands/moderation:reasonMissingCase');
export const ReasonNotExists = T<string>('commands/moderation:reasonNotExists');
export const ReasonUpdated = FT<{ entries: readonly number[]; newReason: string; count: number }, string[]>('commands/moderation:reasonUpdated');
export const ToggleModerationDmToggledEnabled = T<string>('commands/moderation:toggleModerationDmToggledEnabled');
export const ToggleModerationDmToggledDisabled = T<string>('commands/moderation:toggleModerationDmToggledDisabled');
export const UnbanMissingPermission = T<string>('commands/moderation:unbanMissingPermission');
export const UnmuteMissingPermission = T<string>('commands/moderation:unmuteMissingPermission');
export const VmuteMissingPermission = T<string>('commands/moderation:vmuteMissingPermission');
export const VmuteUserNotMuted = T<string>('commands/moderation:vmuteUserNotMuted');
export const WarnDm = FT<{ moderator: string; guild: string; reason: string }, string>('commands/moderation:warnDm');
export const WarnMessage = FT<{ user: User; log: number }, string>('commands/moderation:warnMessage');
export const ModerationOutput = FT<{ count: number; range: string | number; users: string; reason: string | null }, string>(
	'commands/moderation:moderationOutput'
);
export const ModerationOutputWithReason = FT<{ count: number; range: string | number; users: string; reason: string | null }, string>(
	'commands/moderation:moderationOutputWithReason'
);
export const ModerationCaseNotExists = FT<{ count: number }, string>('moderation:caseNotExists');
export const ModerationLogAppealed = T<string>('moderation:logAppealed');
export const ModerationLogDescriptionTypeAndUser = FT<{ data: Moderation.ModerationManagerDescriptionData }, string>(
	'moderation:logDescriptionTypeAndUser'
);
export const ModerationLogDescriptionWithReason = FT<{ data: Moderation.ModerationManagerDescriptionData }, string>(
	'moderation:logDescriptionWithReason'
);
export const ModerationLogDescriptionWithoutReason = FT<{ data: Moderation.ModerationManagerDescriptionData }, string>(
	'moderation:logDescriptionWithoutReason'
);
export const GuildBansEmpty = T<string>('errors:guildBansEmpty');
export const GuildBansNotFound = T<string>('errors:guildBansNotFound');
export const GuildMemberNotVoicechannel = T<string>('errors:guildMemberNotVoicechannel');
export const GuildMuteNotFound = T<string>('errors:guildMuteNotFound');
export const GuildSettingsChannelsMod = T<string>('settings:guildChannelsMod');
export const GuildSettingsRolesRestricted = FT<{ prefix: string; path: string }, string>('settings:guildRolesRestricted');
export const GuildWarnNotFound = T<string>('errors:guildWarnNotFound');
export const ModerationLogExpiresIn = FT<{ duration: number }, string>('moderation:logExpiresIn');
export const ModerationLogFooter = FT<{ caseID: number }, string>('moderation:logFooter');
export const ModerationTimed = FT<{ remaining: number }, string>('errors:modlogTimed');
export const ModerationFailed = FT<{ users: string; count: number }, string>('commands/moderation:moderationFailed');
export const ModerationDmFooter = T<string>('commands/moderation:moderationDmFooter');
export const ModerationDmDescription = FT<{ guild: string; title: string; reason: string | null; duration: number | null }, string[]>(
	'commands/moderation:moderationDmDescription'
);
export const ModerationDmDescriptionWithReason = FT<{ guild: string; title: string; reason: string | null; duration: number | null }, string[]>(
	'commands/moderation:moderationDmDescriptionWithReason'
);
export const ModerationDmDescriptionWithDuration = FT<{ guild: string; title: string; reason: string | null; duration: number | null }, string[]>(
	'commands/moderation:moderationDmDescriptionWithDuration'
);
export const ModerationDmDescriptionWithReasonWithDuration = FT<
	{ guild: string; title: string; reason: string | null; duration: number | null },
	string[]
>('commands/moderation:moderationDmDescriptionWithReasonWithDuration');
export const ModerationDays = T<string>('commands/moderation:moderationDays');
export const Permissions = FT<{ username: string; id: string }, string>('commands/moderation:permissions');
export const PermissionsAll = T<string>('commands/moderation:permissionsAll');
export const SlowmodeDescription = T<string>('commands/moderation:slowmodeDescription');
export const SlowmodeExtended = T<LanguageHelpDisplayOptions>('commands/moderation:slowmodeExtended');
export const SetNicknameDescription = T<string>('commands/moderation:setNicknameDescription');
export const SetNicknameExtended = T<LanguageHelpDisplayOptions>('commands/moderation:setNicknameExtended');
export const AddRoleDescription = T<string>('commands/moderation:addRoleDescription');
export const AddRoleExtended = T<LanguageHelpDisplayOptions>('commands/moderation:addRoleExtended');
export const RemoveroleDescription = T<string>('commands/moderation:removeroleDescription');
export const RemoveroleExtended = T<LanguageHelpDisplayOptions>('commands/moderation:removeroleExtended');
export const BanDescription = T<string>('commands/moderation:banDescription');
export const BanExtended = T<LanguageHelpDisplayOptions>('commands/moderation:banExtended');
export const DehoistDescription = T<string>('commands/moderation:dehoistDescription');
export const DehoistExtended = T<LanguageHelpDisplayOptions>('commands/moderation:dehoistExtended');
export const KickDescription = T<string>('commands/moderation:kickDescription');
export const KickExtended = T<LanguageHelpDisplayOptions>('commands/moderation:kickExtended');
export const LockdownDescription = T<string>('commands/moderation:lockdownDescription');
export const LockdownExtended = T<LanguageHelpDisplayOptions>('commands/moderation:lockdownExtended');
export const MuteCannotManageRoles = T<string>('moderation:muteCannotManageRoles');
export const MuteLowHierarchy = T<string>('moderation:muteLowHierarchy');
export const MuteNotConfigured = T<string>('moderation:muteNotConfigured');
export const MuteNotExists = T<string>('moderation:muteNotExists');
export const MuteNotInMember = T<string>('moderation:muteNotInMember');
export const AutomaticParameterInvalidMissingAction = FT<{ name: string }, string>('selfModeration:commandInvalidMissingAction');
export const AutomaticParameterInvalidMissingArguments = FT<{ name: string }, string>('selfModeration:commandInvalidMissingArguments');
export const AutomaticParameterInvalidSoftaction = FT<{ name: string }, string>('selfModeration:commandInvalidSoftaction');
export const AutomaticParameterInvalidHardaction = FT<{ name: string }, string>('selfModeration:commandInvalidHardaction');
export const AutomaticParameterEnabled = T<string>('selfModeration:commandEnabled');
export const AutomaticParameterDisabled = T<string>('selfModeration:commandDisabled');
export const AutomaticParameterSoftAction = T<string>('selfModeration:commandSoftAction');
export const AutomaticParameterSoftActionWithValue = FT<{ value: string }, string>('selfModeration:commandSoftActionWithValue');
export const AutomaticParameterHardAction = FT<{ value: string }, string>('selfModeration:commandHardAction');
export const AutomaticParameterHardActionDuration = T<string>('selfModeration:commandHardActionDuration');
export const AutomaticParameterHardActionDurationWithValue = FT<{ value: number }, string>('selfModeration:commandHardActionDurationWithValue');
export const AutomaticParameterThresholdMaximum = T<string>('selfModeration:commandThresholdMaximum');
export const AutomaticParameterThresholdMaximumWithValue = FT<{ value: number }, string>('selfModeration:commandThresholdMaximumWithValue');
export const AutomaticParameterThresholdDuration = T<string>('selfModeration:commandThresholdDuration');
export const AutomaticParameterThresholdDurationWithValue = FT<{ value: number }, string>('selfModeration:commandThresholdDurationWithValue');
export const AutomaticParameterShow = FT<
	{
		kEnabled: string;
		kAlert: string;
		kLog: string;
		kDelete: string;
		kHardAction: string;
		hardActionDurationText: string;
		thresholdMaximumText: string | number;
		thresholdDurationText: string;
	},
	readonly string[]
>('selfModeration:commandShow');
export const AutomaticParameterShowDurationPermanent = T<string>('selfModeration:commandShowDurationPermanent');
export const AutomaticParameterShowUnset = T<string>('selfModeration:commandShowUnset');
export const AutomaticValueSoftActionAlert = T<string>('selfModeration:softActionAlert');
export const AutomaticValueSoftActionLog = T<string>('selfModeration:softActionLog');
export const AutomaticValueSoftActionDelete = T<string>('selfModeration:softActionDelete');
export const AutomaticValueHardActionBan = T<string>('selfModeration:hardActionBan');
export const AutomaticValueHardActionKick = T<string>('selfModeration:hardActionKick');
export const AutomaticValueHardActionMute = T<string>('selfModeration:hardActionMute');
export const AutomaticValueHardActionSoftban = T<string>('selfModeration:hardActionSoftban');
export const AutomaticValueHardActionWarning = T<string>('selfModeration:hardActionWarning');
export const AutomaticValueHardActionNone = T<string>('selfModeration:hardActionNone');
export const AutomaticValueEnabled = T<string>('selfModeration:enabled');
export const AutomaticValueDisabled = T<string>('selfModeration:disabled');
export const AutomaticValueMaximumTooShort = FT<{ minimum: number; value: number }, string>('selfModeration:maximumTooShort');
export const AutomaticValueMaximumTooLong = FT<{ maximum: number; value: number }, string>('selfModeration:maximumTooLong');
export const AutomaticValueDurationTooShort = FT<{ minimum: number; value: number }, string>('selfModeration:durationTooShort');
export const AutomaticValueDurationTooLong = FT<{ maximum: number; value: number }, string>('selfModeration:durationTooLong');
export const moderationActions = T<ModerationAction>('moderationActions:actions');
export const ActionApplyReason = FT<{ action: string; reason: string }, string>('moderationActions:applyReason');
export const ActionApplyNoReason = FT<{ action: string }, string>('moderationActions:applyNoReason');
export const ActionRevokeReason = FT<{ action: string; reason: string }, string>('moderationActions:revokeReason');
export const ActionRevokeNoReason = FT<{ action: string }, string>('moderationActions:revokeNoReason');
export const ActionSoftbanReason = FT<{ reason: string }, string>('moderationActions:softbanReason');
export const ActionUnSoftbanReason = FT<{ reason: string }, string>('moderationActions:unSoftbanReason');
export const ActionSoftbanNoReason = T<string>('moderationActions:softbanNoReason');
export const ActionUnSoftbanNoReason = T<string>('moderationActions:unSoftbanNoReason');
export const ActionSetNicknameSet = FT<{ reason: string }, string>('moderationActions:setNicknameSet');
export const ActionSetNicknameRemoved = FT<{ reason: string }, string>('moderationActions:setNicknameRemoved');
export const ActionSetNicknameNoReasonSet = T<string>('moderationActions:setNicknameNoReasonSet');
export const ActionSetNicknameNoReasonRemoved = T<string>('moderationActions:setNicknameNoReasonRemoved');
export const ActionSetupMuteExists = T<string>('moderationActions:setupMuteExists');
export const ActionSetupRestrictionExists = T<string>('moderationActions:setupRestrictionExists');
export const ActionSetupTooManyRoles = T<string>('moderationActions:setupTooManyRoles');
export const ActionSharedRoleSetupExisting = T<string>('moderationActions:sharedRoleSetupExisting');
export const ActionSharedRoleSetupExistingName = T<string>('moderationActions:sharedRoleSetupExistingName');
export const ActionSharedRoleSetupNew = T<string>('moderationActions:sharedRoleSetupNew');
export const ActionSharedRoleSetupAsk = FT<{ role: string; channels: number; permissions: string }, string>('moderationActions:sharedRoleSetupAsk');
export const ActionSharedRoleSetupAskMultipleChannels = FT<{ role: string; channels: number; permissions: string }, string>(
	'moderationActions:sharedRoleSetupAskMultipleChannels'
);
export const ActionSharedRoleSetupAskMultiplePermissions = FT<{ role: string; channels: number; permissions: string }, string>(
	'moderationActions:sharedRoleSetupAskMultiplePermissions'
);
export const ActionSharedRoleSetupAskMultipleChannelsMultiplePermissions = FT<{ role: string; channels: number; permissions: string }, string>(
	'moderationActions:sharedRoleSetupAskMultipleChannelsMultiplePermissions'
);
export const ActionRequiredMember = T<string>('moderationActions:requiredMember');
export const RoleHigherSkyra = T<string>('moderation:roleHigherSkyra');
export const ScoreboardPosition = FT<{ position: number }, string>('moderation:scoreboardPosition');
export const Success = T<string>('moderation:success');
export const ToSkyra = T<string>('moderation:toSkyra');
export const UserSelf = T<string>('moderation:userSelf');
