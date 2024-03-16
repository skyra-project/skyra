import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';
import type { ModerationManagerDescriptionData } from '#utils/moderationConstants';

export const MuteDescription = T('commands/moderation:muteDescription');
export const MuteExtended = T<LanguageHelpDisplayOptions>('commands/moderation:muteExtended');
export const PruneDescription = T('commands/moderation:pruneDescription');
export const PruneExtended = T<LanguageHelpDisplayOptions>('commands/moderation:pruneExtended');
export const PermissionsDescription = T('commands/moderation:permissionsDescription');
export const PermissionsExtended = T<LanguageHelpDisplayOptions>('commands/moderation:permissionsExtended');
export const RestrictAttachmentDescription = T('commands/moderation:restrictAttachmentDescription');
export const RestrictAttachmentExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictAttachmentExtended');
export const RestrictEmbedDescription = T('commands/moderation:restrictEmbedDescription');
export const RestrictEmbedExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictEmbedExtended');
export const RestrictEmojiDescription = T('commands/moderation:restrictEmojiDescription');
export const RestrictEmojiExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictEmojiExtended');
export const RestrictReactionDescription = T('commands/moderation:restrictReactionDescription');
export const RestrictReactionExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictReactionExtended');
export const RestrictVoiceDescription = T('commands/moderation:restrictVoiceDescription');
export const RestrictVoiceExtended = T<LanguageHelpDisplayOptions>('commands/moderation:restrictVoiceExtended');
export const SoftBanDescription = T('commands/moderation:softBanDescription');
export const SoftBanExtended = T<LanguageHelpDisplayOptions>('commands/moderation:softBanExtended');
export const ToggleModerationDmDescription = T('commands/moderation:toggleModerationDmDescription');
export const ToggleModerationDmExtended = T<LanguageHelpDisplayOptions>('commands/moderation:toggleModerationDmExtended');
export const UnbanDescription = T('commands/moderation:unbanDescription');
export const UnbanExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unbanExtended');
export const UnmuteDescription = T('commands/moderation:unmuteDescription');
export const UnmuteExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unmuteExtended');
export const UnrestrictAttachmentDescription = T('commands/moderation:unrestrictAttachmentDescription');
export const UnrestrictAttachmentExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictAttachmentExtended');
export const UnrestrictEmbedDescription = T('commands/moderation:unrestrictEmbedDescription');
export const UnrestrictEmbedExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictEmbedExtended');
export const UnrestrictEmojiDescription = T('commands/moderation:unrestrictEmojiDescription');
export const UnrestrictEmojiExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictEmojiExtended');
export const UnrestrictReactionDescription = T('commands/moderation:unrestrictReactionDescription');
export const UnrestrictReactionExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictReactionExtended');
export const UnrestrictVoiceDescription = T('commands/moderation:unrestrictVoiceDescription');
export const UnrestrictVoiceExtended = T<LanguageHelpDisplayOptions>('commands/moderation:unrestrictVoiceExtended');
export const VmuteDescription = T('commands/moderation:vmuteDescription');
export const VmuteExtended = T<LanguageHelpDisplayOptions>('commands/moderation:vmuteExtended');
export const VoiceKickDescription = T('commands/moderation:voiceKickDescription');
export const VoiceKickExtended = T<LanguageHelpDisplayOptions>('commands/moderation:voiceKickExtended');
export const VunmuteDescription = T('commands/moderation:vunmuteDescription');
export const VunmuteExtended = T<LanguageHelpDisplayOptions>('commands/moderation:vunmuteExtended');
export const WarnDescription = T('commands/moderation:warnDescription');
export const WarnExtended = T<LanguageHelpDisplayOptions>('commands/moderation:warnExtended');
export const SlowmodeSet = FT<{ cooldown: number }, string>('commands/moderation:slowmodeSet');
export const SlowmodeReset = T('commands/moderation:slowmodeReset');
export const BanNotBannable = T('commands/moderation:banNotBannable');
export const DehoistStarting = FT<{ count: number }, string>('commands/moderation:dehoistStarting');
export const DehoistProgress = FT<{ count: number; percentage: number }, string>('commands/moderation:dehoistProgress');
export const DehoistEmbed = FT<
	{ users: number; dehoistedMemberCount: number; dehoistedWithErrorsCount: number; errored: number },
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
export const KickNotKickable = T('commands/moderation:kickNotKickable');
export const LockdownLock = FT<{ channel: string }, string>('commands/moderation:lockdownLock');
export const LockdownLocking = FT<{ channel: string }, string>('commands/moderation:lockdownLocking');
export const LockdownLocked = FT<{ channel: string }, string>('commands/moderation:lockdownLocked');
export const LockdownUnlocked = FT<{ channel: string }, string>('commands/moderation:lockdownUnlocked');
export const LockdownOpen = FT<{ channel: string }, string>('commands/moderation:lockdownOpen');
export const MuteMuted = T('commands/moderation:muteMuted');
export const RestrictLowlevel = T('commands/moderation:restrictLowlevel');
export const PruneAlert = FT<{ count: number; total: number }, string>('commands/moderation:pruneAlert');
export const PruneInvalidPosition = T('commands/moderation:pruneInvalidPosition');
export const PruneNoDeletes = T('commands/moderation:pruneNoDeletes');
export const PruneLogHeader = T('commands/moderation:pruneLogHeader');
export const ToggleModerationDmToggledEnabled = T('commands/moderation:toggleModerationDmToggledEnabled');
export const ToggleModerationDmToggledDisabled = T('commands/moderation:toggleModerationDmToggledDisabled');
export const VmuteUserNotMuted = T('commands/moderation:vmuteUserNotMuted');
export const ModerationOutput = FT<{ count: number; range: string | number; users: string; reason: string | null }, string>(
	'commands/moderation:moderationOutput'
);
export const ModerationOutputWithReason = FT<{ count: number; range: string | number; users: string; reason: string | null }, string>(
	'commands/moderation:moderationOutputWithReason'
);
export const ModerationLogDescriptionTypeAndUser = FT<{ type: string; userId: string; userTag: string }, string>(
	'moderation:logDescriptionTypeAndUser'
);
export const ModerationLogDescriptionWithReason = FT<Pick<ModerationManagerDescriptionData, 'reason' | 'formattedDuration'>, string>(
	'moderation:logDescriptionWithReason'
);
export const ModerationLogDescriptionWithoutReason = FT<ModerationManagerDescriptionData, string>('moderation:logDescriptionWithoutReason');
export const GuildBansEmpty = T('errors:guildBansEmpty');
export const GuildBansNotFound = T('errors:guildBansNotFound');
export const GuildMemberNotVoicechannel = T('errors:guildMemberNotVoicechannel');
export const ModerationLogExpiresIn = FT<{ duration: number }, string>('moderation:logExpiresIn');
export const ModerationLogFooter = FT<{ caseId: number }, string>('moderation:logFooter');
export const ModerationFailed = FT<{ users: string; count: number }, string>('commands/moderation:moderationFailed');
export const ModerationDmFooter = T('commands/moderation:moderationDmFooter');
export const ModerationDmDescription = FT<{ guild: string; title: string; reason: string | null; duration: number | null }, string>(
	'commands/moderation:moderationDmDescription'
);
export const ModerationDmDescriptionWithReason = FT<{ guild: string; title: string; reason: string | null; duration: number | null }, string>(
	'commands/moderation:moderationDmDescriptionWithReason'
);
export const ModerationDmDescriptionWithDuration = FT<{ guild: string; title: string; reason: string | null; duration: number | null }, string>(
	'commands/moderation:moderationDmDescriptionWithDuration'
);
export const ModerationDmDescriptionWithReasonWithDuration = FT<
	{ guild: string; title: string; reason: string | null; duration: number | null },
	string
>('commands/moderation:moderationDmDescriptionWithReasonWithDuration');
export const Permissions = FT<{ username: string; id: string }, string>('commands/moderation:permissions');
export const PermissionsAll = T('commands/moderation:permissionsAll');
export const SlowmodeDescription = T('commands/moderation:slowmodeDescription');
export const SlowmodeExtended = T<LanguageHelpDisplayOptions>('commands/moderation:slowmodeExtended');
export const SetNicknameDescription = T('commands/moderation:setNicknameDescription');
export const SetNicknameExtended = T<LanguageHelpDisplayOptions>('commands/moderation:setNicknameExtended');
export const AddRoleDescription = T('commands/moderation:addRoleDescription');
export const AddRoleExtended = T<LanguageHelpDisplayOptions>('commands/moderation:addRoleExtended');
export const RemoveRoleDescription = T('commands/moderation:removeroleDescription');
export const RemoveRoleExtended = T<LanguageHelpDisplayOptions>('commands/moderation:removeroleExtended');
export const BanDescription = T('commands/moderation:banDescription');
export const BanExtended = T<LanguageHelpDisplayOptions>('commands/moderation:banExtended');
export const DehoistDescription = T('commands/moderation:dehoistDescription');
export const DehoistExtended = T<LanguageHelpDisplayOptions>('commands/moderation:dehoistExtended');
export const KickDescription = T('commands/moderation:kickDescription');
export const KickExtended = T<LanguageHelpDisplayOptions>('commands/moderation:kickExtended');
export const LockdownDescription = T('commands/moderation:lockdownDescription');
export const LockdownExtended = T<LanguageHelpDisplayOptions>('commands/moderation:lockdownExtended');
export const AutomaticParameterInvalidMissingAction = FT<{ name: string }, string>('selfModeration:commandInvalidMissingAction');
export const AutomaticParameterInvalidMissingArguments = FT<{ name: string }, string>('selfModeration:commandInvalidMissingArguments');
export const AutomaticParameterInvalidSoftAction = FT<{ name: string }, string>('selfModeration:commandInvalidSoftaction');
export const AutomaticParameterInvalidHardAction = FT<{ name: string }, string>('selfModeration:commandInvalidHardaction');
export const AutomaticParameterEnabled = T('selfModeration:commandEnabled');
export const AutomaticParameterDisabled = T('selfModeration:commandDisabled');
export const AutomaticParameterSoftAction = T('selfModeration:commandSoftAction');
export const AutomaticParameterSoftActionWithValue = FT<{ value: string }, string>('selfModeration:commandSoftActionWithValue');
export const AutomaticParameterHardAction = FT<{ value: string }, string>('selfModeration:commandHardAction');
export const AutomaticParameterHardActionDuration = T('selfModeration:commandHardActionDuration');
export const AutomaticParameterHardActionDurationWithValue = FT<{ value: number }, string>('selfModeration:commandHardActionDurationWithValue');
export const AutomaticParameterThresholdMaximum = T('selfModeration:commandThresholdMaximum');
export const AutomaticParameterThresholdMaximumWithValue = FT<{ value: number }, string>('selfModeration:commandThresholdMaximumWithValue');
export const AutomaticParameterThresholdDuration = T('selfModeration:commandThresholdDuration');
export const AutomaticParameterThresholdDurationWithValue = FT<{ value: number }, string>('selfModeration:commandThresholdDurationWithValue');
export const AutomaticParameterShow = FT<{
	kEnabled: string;
	kAlert: string;
	kLog: string;
	kDelete: string;
	kHardAction: string;
	hardActionDurationText: string;
	thresholdMaximumText: string | number;
	thresholdDurationText: string;
}>('selfModeration:commandShow');
export const AutomaticParameterShowDurationPermanent = T('selfModeration:commandShowDurationPermanent');
export const AutomaticParameterShowUnset = T('selfModeration:commandShowUnset');
export const AutomaticValueSoftActionAlert = T('selfModeration:softActionAlert');
export const AutomaticValueSoftActionLog = T('selfModeration:softActionLog');
export const AutomaticValueSoftActionDelete = T('selfModeration:softActionDelete');
export const AutomaticValueHardActionBan = T('selfModeration:hardActionBan');
export const AutomaticValueHardActionKick = T('selfModeration:hardActionKick');
export const AutomaticValueHardActionMute = T('selfModeration:hardActionMute');
export const AutomaticValueHardActionSoftBan = T('selfModeration:hardActionSoftban');
export const AutomaticValueHardActionWarning = T('selfModeration:hardActionWarning');
export const AutomaticValueHardActionNone = T('selfModeration:hardActionNone');
export const ActionApplyReason = FT<{ action: string; reason: string }, string>('moderationActions:applyReason');
export const ActionApplyNoReason = FT<{ action: string }, string>('moderationActions:applyNoReason');
export const ActionRevokeReason = FT<{ action: string; reason: string }, string>('moderationActions:revokeReason');
export const ActionRevokeNoReason = FT<{ action: string }, string>('moderationActions:revokeNoReason');
export const ActionSoftBanReason = FT<{ reason: string }, string>('moderationActions:softbanReason');
export const ActionUnSoftBanReason = FT<{ reason: string }, string>('moderationActions:unSoftbanReason');
export const ActionSoftBanNoReason = T('moderationActions:softbanNoReason');
export const ActionUnSoftBanNoReason = T('moderationActions:unSoftbanNoReason');
export const ActionSetNicknameSet = FT<{ reason: string }, string>('moderationActions:setNicknameSet');
export const ActionSetNicknameRemoved = FT<{ reason: string }, string>('moderationActions:setNicknameRemoved');
export const ActionSetNicknameNoReasonSet = T('moderationActions:setNicknameNoReasonSet');
export const ActionSetNicknameNoReasonRemoved = T('moderationActions:setNicknameNoReasonRemoved');
export const ActionSetupMuteExists = T('moderationActions:setupMuteExists');
export const ActionSetupTooManyRoles = T('moderationActions:setupTooManyRoles');
export const ActionSharedRoleSetupExisting = T('moderationActions:sharedRoleSetupExisting');
export const ActionSharedRoleSetupExistingName = T('moderationActions:sharedRoleSetupExistingName');
export const ActionSharedRoleSetupNew = T('moderationActions:sharedRoleSetupNew');
export const ActionSharedRoleSetupAsk = FT<{ role: string; channels: number; permissions: string }, string>('moderationActions:sharedRoleSetupAsk');
export const ActionSharedRoleSetupNoMessage = T('moderationActions:sharedRoleSetupNoMessage');
export const ActionRequiredMember = T('moderationActions:requiredMember');
export const ActionCannotManageRoles = T('moderationActions:actionCannotManageRoles');
export const ActionRoleNotConfigured = T('moderationActions:actionRoleNotConfigured');
export const ActionRoleHigherPosition = T('moderationActions:actionRoleHigherPosition');
export const ActionRoleManaged = T('moderationActions:actionRoleManaged');
export const RoleHigher = T('moderation:roleHigher');
export const RoleHigherSkyra = T('moderation:roleHigherSkyra');
export const Success = T('moderation:success');
export const ToSkyra = T('moderation:toSkyra');
export const UserSelf = T('moderation:userSelf');
