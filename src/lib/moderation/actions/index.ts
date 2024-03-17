import { ModerationActionBan } from '#lib/moderation/actions/ModerationActionBan';
import { ModerationActionKick } from '#lib/moderation/actions/ModerationActionKick';
import { ModerationActionRestrictedAll } from '#lib/moderation/actions/ModerationActionRestrictedAll';
import { ModerationActionRestrictedAttachment } from '#lib/moderation/actions/ModerationActionRestrictedAttachment';
import { ModerationActionRestrictedEmbed } from '#lib/moderation/actions/ModerationActionRestrictedEmbed';
import { ModerationActionRestrictedEmoji } from '#lib/moderation/actions/ModerationActionRestrictedEmoji';
import { ModerationActionRestrictedReaction } from '#lib/moderation/actions/ModerationActionRestrictedReaction';
import { ModerationActionRestrictedVoice } from '#lib/moderation/actions/ModerationActionRestrictedVoice';
import { ModerationActionRoleAdd } from '#lib/moderation/actions/ModerationActionRoleAdd';
import { ModerationActionRoleRemove } from '#lib/moderation/actions/ModerationActionRoleRemove';
import { ModerationActionSetNickname } from '#lib/moderation/actions/ModerationActionSetNickname';
import { ModerationActionSoftban } from '#lib/moderation/actions/ModerationActionSoftBan';
import { ModerationActionTimeout } from '#lib/moderation/actions/ModerationActionTimeout';
import { ModerationActionVoiceKick } from '#lib/moderation/actions/ModerationActionVoiceKick';
import { ModerationActionVoiceMute } from '#lib/moderation/actions/ModerationActionVoiceMute';
import { ModerationActionWarning } from '#lib/moderation/actions/ModerationActionWarning';
import type { RoleModerationAction } from '#lib/moderation/actions/base/RoleModerationAction';
import { TypeVariation } from '#utils/moderationConstants';

export const ModerationActions = {
	ban: new ModerationActionBan(),
	kick: new ModerationActionKick(),
	mute: new ModerationActionRestrictedAll(),
	timeout: new ModerationActionTimeout(),
	restrictedAttachment: new ModerationActionRestrictedAttachment(),
	restrictedEmbed: new ModerationActionRestrictedEmbed(),
	restrictedEmoji: new ModerationActionRestrictedEmoji(),
	restrictedReaction: new ModerationActionRestrictedReaction(),
	restrictedVoice: new ModerationActionRestrictedVoice(),
	roleAdd: new ModerationActionRoleAdd(),
	roleRemove: new ModerationActionRoleRemove(),
	setNickname: new ModerationActionSetNickname(),
	softban: new ModerationActionSoftban(),
	voiceKick: new ModerationActionVoiceKick(),
	voiceMute: new ModerationActionVoiceMute(),
	warning: new ModerationActionWarning()
} as const;

export function getAction<const Type extends TypeVariation>(type: Type): (typeof ModerationActions)[(typeof ActionMappings)[Type]] {
	return ModerationActions[ActionMappings[type]];
}

const ActionMappings = {
	[TypeVariation.RoleAdd]: 'roleAdd',
	[TypeVariation.Ban]: 'ban',
	[TypeVariation.Kick]: 'kick',
	[TypeVariation.Mute]: 'mute',
	[TypeVariation.Timeout]: 'timeout',
	[TypeVariation.RoleRemove]: 'roleRemove',
	[TypeVariation.RestrictedAttachment]: 'restrictedAttachment',
	[TypeVariation.RestrictedEmbed]: 'restrictedEmbed',
	[TypeVariation.RestrictedEmoji]: 'restrictedEmoji',
	[TypeVariation.RestrictedReaction]: 'restrictedReaction',
	[TypeVariation.RestrictedVoice]: 'restrictedVoice',
	[TypeVariation.SetNickname]: 'setNickname',
	[TypeVariation.Softban]: 'softban',
	[TypeVariation.VoiceKick]: 'voiceKick',
	[TypeVariation.VoiceMute]: 'voiceMute',
	[TypeVariation.Warning]: 'warning'
} as const satisfies Readonly<Record<TypeVariation, ModerationActionKey>>;

export type ModerationActionKey = keyof typeof ModerationActions;
export type RoleModerationActionKey = {
	[K in ModerationActionKey]: (typeof ModerationActions)[K] extends RoleModerationAction<infer _, infer _> ? K : never;
}[ModerationActionKey];
