import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationActions, type ModerationActionKey } from '#lib/moderation/actions/index';
import type { TypedT } from '#lib/types';
import { TypeVariation } from '#utils/moderationConstants';

export function getAction<const Type extends TypeVariation>(type: Type): (typeof ModerationActions)[(typeof ActionMappings)[Type]] {
	return ModerationActions[ActionMappings[type]];
}

export function getTranslationKey<const Type extends TypeVariation>(type: Type): (typeof TranslationMappings)[Type] {
	return TranslationMappings[type];
}

const ActionMappings = {
	[TypeVariation.AddRole]: 'roleAdd',
	[TypeVariation.Ban]: 'ban',
	[TypeVariation.Kick]: 'kick',
	[TypeVariation.Mute]: 'mute',
	[TypeVariation.RemoveRole]: 'roleRemove',
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

const Root = LanguageKeys.Moderation;
const TranslationMappings = {
	[TypeVariation.AddRole]: Root.TypeAddRole,
	[TypeVariation.Ban]: Root.TypeBan,
	[TypeVariation.Kick]: Root.TypeKick,
	[TypeVariation.Mute]: Root.TypeMute,
	[TypeVariation.RemoveRole]: Root.TypeRemoveRole,
	[TypeVariation.RestrictedAttachment]: Root.TypeRestrictedAttachment,
	[TypeVariation.RestrictedEmbed]: Root.TypeRestrictedEmbed,
	[TypeVariation.RestrictedEmoji]: Root.TypeRestrictedEmoji,
	[TypeVariation.RestrictedReaction]: Root.TypeRestrictedReaction,
	[TypeVariation.RestrictedVoice]: Root.TypeRestrictedVoice,
	[TypeVariation.SetNickname]: Root.TypeSetNickname,
	[TypeVariation.Softban]: Root.TypeSoftban,
	[TypeVariation.VoiceKick]: Root.TypeVoiceKick,
	[TypeVariation.VoiceMute]: Root.TypeVoiceMute,
	[TypeVariation.Warning]: Root.TypeWarning
} as const satisfies Readonly<Record<TypeVariation, TypedT>>;
