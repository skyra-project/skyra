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
import { ModerationActionVoiceKick } from '#lib/moderation/actions/ModerationActionVoiceKick';
import { ModerationActionVoiceMute } from '#lib/moderation/actions/ModerationActionVoiceMute';
import { ModerationActionWarning } from '#lib/moderation/actions/ModerationActionWarning';
import type { RoleModerationAction } from './base/RoleModerationAction.js';

export const ModerationActions = {
	ban: new ModerationActionBan(),
	kick: new ModerationActionKick(),
	mute: new ModerationActionRestrictedAll(),
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

export type ModerationActionKey = keyof typeof ModerationActions;
export type RoleModerationActionKey = {
	[K in ModerationActionKey]: (typeof ModerationActions)[K] extends RoleModerationAction ? K : never;
}[ModerationActionKey];
