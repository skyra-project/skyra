import { ModerationAction } from '@lib/types/Languages';
import { T } from '@lib/types/Shared';
import { Moderation } from '@utils/constants';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';
import { User } from 'discord.js';

export const HistoryDescription = T<string>('commandHistoryDescription');
export const HistoryExtended = T<LanguageHelpDisplayOptions>('commandHistoryExtended');
export const HistoryFooterNew = T<
	(params: {
		warnings: number;
		mutes: number;
		kicks: number;
		bans: number;
		warningsText: string;
		mutesText: string;
		kicksText: string;
		bansText: string;
	}) => string
>('commandHistoryFooterNew');
export const HistoryFooterWarning = T<(params: { count: number }) => string>('commandHistoryFooterWarning');
export const HistoryFooterWarningPlural = T<(params: { count: number }) => string>('commandHistoryFooterWarningPlural');
export const HistoryFooterMutes = T<(params: { count: number }) => string>('commandHistoryFooterMutes');
export const HistoryFooterMutesPlural = T<(params: { count: number }) => string>('commandHistoryFooterMutesPlural');
export const HistoryFooterKicks = T<(params: { count: number }) => string>('commandHistoryFooterKicks');
export const HistoryFooterKicksPlural = T<(params: { count: number }) => string>('commandHistoryFooterKicksPlural');
export const HistoryFooterBans = T<(params: { count: number }) => string>('commandHistoryFooterBans');
export const HistoryFooterBansPlural = T<(params: { count: number }) => string>('commandHistoryFooterBansPlural');
export const ModerationsDescription = T<string>('commandModerationsDescription');
export const ModerationsExtended = T<LanguageHelpDisplayOptions>('commandModerationsExtended');
export const ModerationsEmpty = T<string>('commandModerationsEmpty');
export const ModerationsAmount = T<(params: { count: number }) => string>('commandModerationsAmount');
export const ModerationsAmountPlural = T<(params: { count: number }) => string>('commandModerationsAmountPlural');
export const MutesDescription = T<string>('commandMutesDescription');
export const MutesExtended = T<LanguageHelpDisplayOptions>('commandMutesExtended');
export const WarningsDescription = T<string>('commandWarningsDescription');
export const WarningsExtended = T<LanguageHelpDisplayOptions>('commandWarningsExtended');
export const MuteDescription = T<string>('commandMuteDescription');
export const MuteExtended = T<LanguageHelpDisplayOptions>('commandMuteExtended');
export const PruneDescription = T<string>('commandPruneDescription');
export const PruneExtended = T<LanguageHelpDisplayOptions>('commandPruneExtended');
export const ReasonDescription = T<string>('commandReasonDescription');
export const ReasonExtended = T<LanguageHelpDisplayOptions>('commandReasonExtended');
export const RestrictAttachmentDescription = T<string>('commandRestrictAttachmentDescription');
export const RestrictAttachmentExtended = T<LanguageHelpDisplayOptions>('commandRestrictAttachmentExtended');
export const RestrictEmbedDescription = T<string>('commandRestrictEmbedDescription');
export const RestrictEmbedExtended = T<LanguageHelpDisplayOptions>('commandRestrictEmbedExtended');
export const RestrictEmojiDescription = T<string>('commandRestrictEmojiDescription');
export const RestrictEmojiExtended = T<LanguageHelpDisplayOptions>('commandRestrictEmojiExtended');
export const RestrictReactionDescription = T<string>('commandRestrictReactionDescription');
export const RestrictReactionExtended = T<LanguageHelpDisplayOptions>('commandRestrictReactionExtended');
export const RestrictVoiceDescription = T<string>('commandRestrictVoiceDescription');
export const RestrictVoiceExtended = T<LanguageHelpDisplayOptions>('commandRestrictVoiceExtended');
export const SoftBanDescription = T<string>('commandSoftBanDescription');
export const SoftBanExtended = T<LanguageHelpDisplayOptions>('commandSoftBanExtended');
export const ToggleModerationDmDescription = T<string>('commandToggleModerationDmDescription');
export const ToggleModerationDmExtended = T<LanguageHelpDisplayOptions>('commandToggleModerationDmExtended');
export const UnbanDescription = T<string>('commandUnbanDescription');
export const UnbanExtended = T<LanguageHelpDisplayOptions>('commandUnbanExtended');
export const UnmuteDescription = T<string>('commandUnmuteDescription');
export const UnmuteExtended = T<LanguageHelpDisplayOptions>('commandUnmuteExtended');
export const UnrestrictAttachmentDescription = T<string>('commandUnrestrictAttachmentDescription');
export const UnrestrictAttachmentExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictAttachmentExtended');
export const UnrestrictEmbedDescription = T<string>('commandUnrestrictEmbedDescription');
export const UnrestrictEmbedExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictEmbedExtended');
export const UnrestrictEmojiDescription = T<string>('commandUnrestrictEmojiDescription');
export const UnrestrictEmojiExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictEmojiExtended');
export const UnrestrictReactionDescription = T<string>('commandUnrestrictReactionDescription');
export const UnrestrictReactionExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictReactionExtended');
export const UnrestrictVoiceDescription = T<string>('commandUnrestrictVoiceDescription');
export const UnrestrictVoiceExtended = T<LanguageHelpDisplayOptions>('commandUnrestrictVoiceExtended');
export const UnwarnDescription = T<string>('commandUnwarnDescription');
export const UnwarnExtended = T<LanguageHelpDisplayOptions>('commandUnwarnExtended');
export const VmuteDescription = T<string>('commandVmuteDescription');
export const VmuteExtended = T<LanguageHelpDisplayOptions>('commandVmuteExtended');
export const VoiceKickDescription = T<string>('commandVoiceKickDescription');
export const VoiceKickExtended = T<LanguageHelpDisplayOptions>('commandVoiceKickExtended');
export const VunmuteDescription = T<string>('commandVunmuteDescription');
export const VunmuteExtended = T<LanguageHelpDisplayOptions>('commandVunmuteExtended');
export const WarnDescription = T<string>('commandWarnDescription');
export const WarnExtended = T<LanguageHelpDisplayOptions>('commandWarnExtended');
export const RaidDisabled = T<string>('commandRaidDisabled');
export const RaidMissingKick = T<string>('commandRaidMissingKick');
export const RaidList = T<string>('commandRaidList');
export const RaidClear = T<string>('commandRaidClear');
export const RaidCool = T<string>('commandRaidCool');
export const Flow = T<(params: { amount: number }) => string>('commandFlow');
export const TimeTimed = T<string>('commandTimeTimed');
export const TimeUndefinedTime = T<string>('commandTimeUndefinedTime');
export const TimeUnsupportedTipe = T<string>('commandTimeUnsupportedTipe');
export const TimeNotScheduled = T<string>('commandTimeNotScheduled');
export const TimeAborted = T<(params: { title: string }) => string>('commandTimeAborted');
export const TimeScheduled = T<(params: { title: string; user: User; time: number }) => string>('commandTimeScheduled');
export const SlowmodeSet = T<(params: { cooldown: number }) => string>('commandSlowmodeSet');
export const SlowmodeReset = T<string>('commandSlowmodeReset');
export const SlowmodeTooLong = T<string>('commandSlowmodeTooLong');
export const BanNotBannable = T<string>('commandBanNotBannable');
export const DehoistStarting = T<(params: { count: number }) => string>('commandDehoistStarting');
export const DehoistProgress = T<(params: { count: number; percentage: number }) => string>('commandDehoistProgress');
export const DehoistEmbed = T<
	(params: {
		users: number;
		dehoistedMemberCount: number;
		dehoistedWithErrorsCount: number;
		errored: number;
	}) => {
		title: string;
		descriptionNoone: string;
		descriptionWithError: string;
		descriptionWithMultipleErrors: string;
		description: string;
		descriptionMultipleMembers: string;
		fieldErrorTitle: string;
	}
>('commandDehoistEmbed');
export const KickNotKickable = T<string>('commandKickNotKickable');
export const LockdownLock = T<(params: { channel: string }) => string>('commandLockdownLock');
export const LockdownLocking = T<(params: { channel: string }) => string>('commandLockdownLocking');
export const LockdownLocked = T<(params: { channel: string }) => string>('commandLockdownLocked');
export const LockdownUnlocked = T<(params: { channel: string }) => string>('commandLockdownUnlocked');
export const LockdownOpen = T<(params: { channel: string }) => string>('commandLockdownOpen');
export const MuteLowlevel = T<string>('commandMuteLowlevel');
export const MuteConfigureCancelled = T<string>('commandMuteConfigureCancelled');
export const MuteConfigure = T<string>('commandMuteConfigure');
export const MuteConfigureToomanyRoles = T<string>('commandMuteConfigureToomanyRoles');
export const MuteMuted = T<string>('commandMuteMuted');
export const MuteUserNotMuted = T<string>('commandMuteUserNotMuted');
export const MuteUnconfigured = T<string>('commandMuteUnconfigured');
export const MutecreateMissingPermission = T<string>('commandMutecreateMissingPermission');
export const RestrictLowlevel = T<string>('commandRestrictLowlevel');
export const PruneInvalid = T<string>('commandPruneInvalid');
export const PruneAlert = T<(params: { count: number; total: number }) => string>('commandPruneAlert');
export const PruneAlertPlural = T<(params: { count: number; total: number }) => string>('commandPruneAlertPlural');
export const PruneInvalidPosition = T<string>('commandPruneInvalidPosition');
export const PruneInvalidFilter = T<string>('commandPruneInvalidFilter');
export const PruneNoDeletes = T<string>('commandPruneNoDeletes');
export const PruneLogHeader = T<string>('commandPruneLogHeader');
export const PruneLogMessage = T<(params: { channel: string; author: string; count: number }) => string>('commandPruneLogMessage');
export const PruneLogMessagePlural = T<(params: { channel: string; author: string; count: number }) => string>('commandPruneLogMessagePlural');
export const ReasonMissingCase = T<string>('commandReasonMissingCase');
export const ReasonNotExists = T<string>('commandReasonNotExists');
export const ReasonUpdated = T<(params: { entries: readonly number[]; newReason: string; count: number }) => string[]>('commandReasonUpdated');
export const ReasonUpdatedPlural = T<(params: { entries: readonly number[]; newReason: string; count: number }) => string[]>(
	'commandReasonUpdatedPlural'
);
export const ToggleModerationDmToggledEnabled = T<string>('commandToggleModerationDmToggledEnabled');
export const ToggleModerationDmToggledDisabled = T<string>('commandToggleModerationDmToggledDisabled');
export const UnbanMissingPermission = T<string>('commandUnbanMissingPermission');
export const UnmuteMissingPermission = T<string>('commandUnmuteMissingPermission');
export const VmuteMissingPermission = T<string>('commandVmuteMissingPermission');
export const VmuteUserNotMuted = T<string>('commandVmuteUserNotMuted');
export const WarnDm = T<(params: { moderator: string; guild: string; reason: string }) => string>('commandWarnDm');
export const WarnMessage = T<(params: { user: User; log: number }) => string>('commandWarnMessage');
export const ModerationOutput = T<(params: { count: number; range: string | number; users: string; reason: string | null }) => string>(
	'commandModerationOutput'
);
export const ModerationOutputPlural = T<(params: { count: number; range: string | number; users: string; reason: string | null }) => string>(
	'commandModerationOutputPlural'
);
export const ModerationOutputWithReason = T<(params: { count: number; range: string | number; users: string; reason: string | null }) => string>(
	'commandModerationOutputWithReason'
);
export const ModerationCaseNotExists = T<string>('moderationCaseNotExists');
export const ModerationCasesNotExist = T<string>('moderationCasesNotExist');
export const ModerationLogAppealed = T<string>('moderationLogAppealed');
export const ModerationLogDescription = T<(params: { data: Moderation.ModerationManagerDescriptionData }) => string>('moderationLogDescription');
export const GuildBansEmpty = T<string>('guildBansEmpty');
export const GuildBansNotFound = T<string>('guildBansNotFound');
export const GuildMemberNotVoicechannel = T<string>('guildMemberNotVoicechannel');
export const GuildMuteNotFound = T<string>('guildMuteNotFound');
export const GuildSettingsChannelsMod = T<string>('guildSettingsChannelsMod');
export const GuildSettingsRolesRestricted = T<(params: { prefix: string; path: string }) => string>('guildSettingsRolesRestricted');
export const GuildWarnNotFound = T<string>('guildWarnNotFound');
export const ModerationLogExpiresIn = T<(params: { duration: number }) => string>('moderationLogExpiresIn');
export const ModerationLogFooter = T<(params: { caseID: number }) => string>('moderationLogFooter');
export const ModerationTimed = T<(params: { remaining: number }) => string>('modlogTimed');
export const ModerationOutputWithReasonPlural = T<
	(params: { count: number; range: string | number; users: string; reason: string | null }) => string
>('commandModerationOutputWithReasonPlural');
export const ModerationFailed = T<(params: { users: string; count: number }) => string>('commandModerationFailed');
export const ModerationFailedPlural = T<(params: { users: string; count: number }) => string>('commandModerationFailedPlural');
export const ModerationDmFooter = T<string>('commandModerationDmFooter');
export const ModerationDmDescription = T<(params: { guild: string; title: string; reason: string | null; duration: number | null }) => string[]>(
	'commandModerationDmDescription'
);
export const ModerationDmDescriptionWithReason = T<
	(params: { guild: string; title: string; reason: string | null; duration: number | null }) => string[]
>('commandModerationDmDescriptionWithReason');
export const ModerationDmDescriptionWithDuration = T<
	(params: { guild: string; title: string; reason: string | null; duration: number | null }) => string[]
>('commandModerationDmDescriptionWithDuration');
export const ModerationDmDescriptionWithReasonWithDuratio = T<
	(params: { guild: string; title: string; reason: string | null; duration: number | null }) => string[]
>('commandModerationDmDescriptionWithReasonWithDuration');
export const ModerationDays = T<string>('commandModerationDays');
export const Permissions = T<(params: { username: string; id: string }) => string>('commandPermissions');
export const PermissionsAll = T<string>('commandPermissionsAll');
export const SlowmodeDescription = T<string>('commandSlowmodeDescription');
export const SlowmodeExtended = T<LanguageHelpDisplayOptions>('commandSlowmodeExtended');
export const SetNicknameDescription = T<string>('commandSetNicknameDescription');
export const SetNicknameExtended = T<LanguageHelpDisplayOptions>('commandSetNicknameExtended');
export const AddRoleDescription = T<string>('commandAddRoleDescription');
export const AddRoleExtended = T<LanguageHelpDisplayOptions>('commandAddRoleExtended');
export const RemoveroleDescription = T<string>('commandRemoveroleDescription');
export const RemoveroleExtended = T<LanguageHelpDisplayOptions>('commandRemoveroleExtended');
export const BanDescription = T<string>('commandBanDescription');
export const BanExtended = T<LanguageHelpDisplayOptions>('commandBanExtended');
export const DehoistDescription = T<string>('commandDehoistDescription');
export const DehoistExtended = T<LanguageHelpDisplayOptions>('commandDehoistExtended');
export const KickDescription = T<string>('commandKickDescription');
export const KickExtended = T<LanguageHelpDisplayOptions>('commandKickExtended');
export const LockdownDescription = T<string>('commandLockdownDescription');
export const LockdownExtended = T<LanguageHelpDisplayOptions>('commandLockdownExtended');
export const MuteCannotManageRoles = T<string>('muteCannotManageRoles');
export const MuteLowHierarchy = T<string>('muteLowHierarchy');
export const MuteNotConfigured = T<string>('muteNotConfigured');
export const MuteNotExists = T<string>('muteNotExists');
export const MuteNotInMember = T<string>('muteNotInMember');
export const AutomaticParameterInvalidMissingAction = T<(params: { name: string }) => string>('selfModerationCommandInvalidMissingAction');
export const AutomaticParameterInvalidMissingArguments = T<(params: { name: string }) => string>('selfModerationCommandInvalidMissingArguments');
export const AutomaticParameterInvalidSoftaction = T<(params: { name: string }) => string>('selfModerationCommandInvalidSoftaction');
export const AutomaticParameterInvalidHardaction = T<(params: { name: string }) => string>('selfModerationCommandInvalidHardaction');
export const AutomaticParameterEnabled = T<string>('selfModerationCommandEnabled');
export const AutomaticParameterDisabled = T<string>('selfModerationCommandDisabled');
export const AutomaticParameterSoftAction = T<string>('selfModerationCommandSoftAction');
export const AutomaticParameterSoftActionWithValue = T<(params: { value: string }) => string>('selfModerationCommandSoftActionWithValue');
export const AutomaticParameterHardAction = T<(params: { value: string }) => string>('selfModerationCommandHardAction');
export const AutomaticParameterHardActionDuration = T<string>('selfModerationCommandHardActionDuration');
export const AutomaticParameterHardActionDurationWithValue = T<(params: { value: number }) => string>(
	'selfModerationCommandHardActionDurationWithValue'
);
export const AutomaticParameterThresholdMaximum = T<string>('selfModerationCommandThresholdMaximum');
export const AutomaticParameterThresholdMaximumWithValue = T<(params: { value: number }) => string>('selfModerationCommandThresholdMaximumWithValue');
export const AutomaticParameterThresholdDuration = T<string>('selfModerationCommandThresholdDuration');
export const AutomaticParameterThresholdDurationWithValue = T<(params: { value: number }) => string>(
	'selfModerationCommandThresholdDurationWithValue'
);
export const AutomaticParameterShow = T<
	(params: {
		kEnabled: string;
		kAlert: string;
		kLog: string;
		kDelete: string;
		kHardAction: string;
		hardActionDurationText: string;
		thresholdMaximumText: string | number;
		thresholdDurationText: string;
	}) => readonly string[]
>('selfModerationCommandShow');
export const AutomaticParameterShowDurationPermanent = T<string>('selfModerationCommandShowDurationPermanent');
export const AutomaticParameterShowUnset = T<string>('selfModerationCommandShowUnset');
export const AutomaticValueSoftActionAlert = T<string>('selfModerationSoftActionAlert');
export const AutomaticValueSoftActionLog = T<string>('selfModerationSoftActionLog');
export const AutomaticValueSoftActionDelete = T<string>('selfModerationSoftActionDelete');
export const AutomaticValueHardActionBan = T<string>('selfModerationHardActionBan');
export const AutomaticValueHardActionKick = T<string>('selfModerationHardActionKick');
export const AutomaticValueHardActionMute = T<string>('selfModerationHardActionMute');
export const AutomaticValueHardActionSoftban = T<string>('selfModerationHardActionSoftban');
export const AutomaticValueHardActionWarning = T<string>('selfModerationHardActionWarning');
export const AutomaticValueHardActionNone = T<string>('selfModerationHardActionNone');
export const AutomaticValueEnabled = T<string>('selfModerationEnabled');
export const AutomaticValueDisabled = T<string>('selfModerationDisabled');
export const AutomaticValueMaximumTooShort = T<(params: { minimum: number; value: number }) => string>('selfModerationMaximumTooShort');
export const AutomaticValueMaximumTooLong = T<(params: { maximum: number; value: number }) => string>('selfModerationMaximumTooLong');
export const AutomaticValueDurationTooShort = T<(params: { minimum: number; value: number }) => string>('selfModerationDurationTooShort');
export const AutomaticValueDurationTooLong = T<(params: { maximum: number; value: number }) => string>('selfModerationDurationTooLong');
export const moderationActions = T<ModerationAction>('moderationActions');
export const ActionApplyReason = T<(params: { action: string; reason: string }) => string>('actionApplyReason');
export const ActionApplyNoReason = T<(params: { action: string }) => string>('actionApplyNoReason');
export const ActionRevokeReason = T<(params: { action: string; reason: string }) => string>('actionRevokeReason');
export const ActionRevokeNoReason = T<(params: { action: string }) => string>('actionRevokeNoReason');
export const ActionSoftbanReason = T<(params: { reason: string }) => string>('actionSoftbanReason');
export const ActionUnSoftbanReason = T<(params: { reason: string }) => string>('actionUnSoftbanReason');
export const ActionSoftbanNoReason = T<string>('actionSoftbanNoReason');
export const ActionUnSoftbanNoReason = T<string>('actionUnSoftbanNoReason');
export const ActionSetNicknameSet = T<(params: { reason: string }) => string>('actionSetNicknameSet');
export const ActionSetNicknameRemoved = T<(params: { reason: string }) => string>('actionSetNicknameRemoved');
export const ActionSetNicknameNoReasonSet = T<string>('actionSetNicknameNoReasonSet');
export const ActionSetNicknameNoReasonRemoved = T<string>('actionSetNicknameNoReasonRemoved');
export const ActionSetupMuteExists = T<string>('actionSetupMuteExists');
export const ActionSetupRestrictionExists = T<string>('actionSetupRestrictionExists');
export const ActionSetupTooManyRoles = T<string>('actionSetupTooManyRoles');
export const ActionSharedRoleSetupExisting = T<string>('actionSharedRoleSetupExisting');
export const ActionSharedRoleSetupExistingName = T<string>('actionSharedRoleSetupExistingName');
export const ActionSharedRoleSetupNew = T<string>('actionSharedRoleSetupNew');
export const ActionSharedRoleSetupAsk = T<(params: { role: string; channels: number; permissions: string }) => string>('actionSharedRoleSetupAsk');
export const ActionSharedRoleSetupAskMultipleChannels = T<(params: { role: string; channels: number; permissions: string }) => string>(
	'actionSharedRoleSetupAskMultipleChannels'
);
export const ActionSharedRoleSetupAskMultiplePermissions = T<(params: { role: string; channels: number; permissions: string }) => string>(
	'actionSharedRoleSetupAskMultiplePermissions'
);
export const ActionSharedRoleSetupAskMultipleChannelsMultiplePermissions = T<
	(params: { role: string; channels: number; permissions: string }) => string
>('actionSharedRoleSetupAskMultipleChannelsMultiplePermissions');
export const ActionRequiredMember = T<string>('actionRequiredMember');
