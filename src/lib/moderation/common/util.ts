import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { TypedT } from '#lib/types';
import { TypeVariation } from '#utils/moderationConstants';

export function getTranslationKey<const Type extends TypeVariation>(type: Type): (typeof TranslationMappings)[Type] {
	return TranslationMappings[type];
}

const Root = LanguageKeys.Moderation;
const TranslationMappings = {
	[TypeVariation.AddRole]: Root.TypeAddRole,
	[TypeVariation.Ban]: Root.TypeBan,
	[TypeVariation.Kick]: Root.TypeKick,
	[TypeVariation.Mute]: Root.TypeMute,
	[TypeVariation.Timeout]: Root.TypeTimeout,
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
