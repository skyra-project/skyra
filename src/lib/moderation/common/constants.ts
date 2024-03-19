import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { TypedT } from '#lib/types';
import { Colors } from '#utils/constants';
import { TypeMetadata, TypeVariation } from '#utils/moderationConstants';
import { isNullishOrZero } from '@sapphire/utilities';
import type { ModerationManager } from '../managers/ModerationManager.js';

const Root = LanguageKeys.Moderation;

export const TranslationMappings = {
	[TypeVariation.Ban]: Root.TypeBan,
	[TypeVariation.Kick]: Root.TypeKick,
	[TypeVariation.Mute]: Root.TypeMute,
	[TypeVariation.RestrictedAttachment]: Root.TypeRestrictedAttachment,
	[TypeVariation.RestrictedEmbed]: Root.TypeRestrictedEmbed,
	[TypeVariation.RestrictedEmoji]: Root.TypeRestrictedEmoji,
	[TypeVariation.RestrictedReaction]: Root.TypeRestrictedReaction,
	[TypeVariation.RestrictedVoice]: Root.TypeRestrictedVoice,
	[TypeVariation.RoleAdd]: Root.TypeRoleAdd,
	[TypeVariation.RoleRemove]: Root.TypeRoleRemove,
	[TypeVariation.SetNickname]: Root.TypeSetNickname,
	[TypeVariation.Softban]: Root.TypeSoftban,
	[TypeVariation.Timeout]: Root.TypeTimeout,
	[TypeVariation.VoiceKick]: Root.TypeVoiceKick,
	[TypeVariation.VoiceMute]: Root.TypeVoiceMute,
	[TypeVariation.Warning]: Root.TypeWarning
} as const satisfies Readonly<Record<TypeVariation, TypedT>>;

export const UndoTaskNameMappings = {
	[TypeVariation.Warning]: 'moderationEndWarning',
	[TypeVariation.Mute]: 'moderationEndMute',
	[TypeVariation.Ban]: 'moderationEndBan',
	[TypeVariation.VoiceMute]: 'moderationEndVoiceMute',
	[TypeVariation.RestrictedAttachment]: 'moderationEndRestrictionAttachment',
	[TypeVariation.RestrictedReaction]: 'moderationEndRestrictionReaction',
	[TypeVariation.RestrictedEmbed]: 'moderationEndRestrictionEmbed',
	[TypeVariation.RestrictedEmoji]: 'moderationEndRestrictionEmoji',
	[TypeVariation.RestrictedVoice]: 'moderationEndRestrictionVoice',
	[TypeVariation.SetNickname]: 'moderationEndSetNickname',
	[TypeVariation.RoleAdd]: 'moderationEndAddRole',
	[TypeVariation.RoleRemove]: 'moderationEndRemoveRole'
} as const;

const TypeCodes = {
	Ban: combineTypeData(TypeVariation.Ban),
	Kick: combineTypeData(TypeVariation.Kick),
	Mute: combineTypeData(TypeVariation.Mute),
	RestrictedAttachment: combineTypeData(TypeVariation.RestrictedAttachment),
	RestrictedEmbed: combineTypeData(TypeVariation.RestrictedEmbed),
	RestrictedEmoji: combineTypeData(TypeVariation.RestrictedEmoji),
	RestrictedReaction: combineTypeData(TypeVariation.RestrictedReaction),
	RestrictedVoice: combineTypeData(TypeVariation.RestrictedVoice),
	RoleAdd: combineTypeData(TypeVariation.RoleAdd),
	RoleRemove: combineTypeData(TypeVariation.RoleRemove),
	SetNickname: combineTypeData(TypeVariation.SetNickname),
	SoftBan: combineTypeData(TypeVariation.Softban),
	Timeout: combineTypeData(TypeVariation.Timeout),
	VoiceKick: combineTypeData(TypeVariation.VoiceKick),
	VoiceMute: combineTypeData(TypeVariation.VoiceMute),
	Warning: combineTypeData(TypeVariation.Warning),
	UndoBan: combineTypeData(TypeVariation.Ban, TypeMetadata.Undo),
	UndoMute: combineTypeData(TypeVariation.Mute, TypeMetadata.Undo),
	UndoRestrictedAttachment: combineTypeData(TypeVariation.RestrictedAttachment, TypeMetadata.Undo),
	UndoRestrictedEmbed: combineTypeData(TypeVariation.RestrictedEmbed, TypeMetadata.Undo),
	UndoRestrictedEmoji: combineTypeData(TypeVariation.RestrictedEmoji, TypeMetadata.Undo),
	UndoRestrictedReaction: combineTypeData(TypeVariation.RestrictedReaction, TypeMetadata.Undo),
	UndoRestrictedVoice: combineTypeData(TypeVariation.RestrictedVoice, TypeMetadata.Undo),
	UndoRoleAdd: combineTypeData(TypeVariation.RoleAdd, TypeMetadata.Undo),
	UndoRoleRemove: combineTypeData(TypeVariation.RoleRemove, TypeMetadata.Undo),
	UndoSetNickname: combineTypeData(TypeVariation.SetNickname, TypeMetadata.Undo),
	UndoTimeout: combineTypeData(TypeVariation.Timeout, TypeMetadata.Undo),
	UndoVoiceMute: combineTypeData(TypeVariation.VoiceMute, TypeMetadata.Undo),
	UndoWarning: combineTypeData(TypeVariation.Warning, TypeMetadata.Undo),
	TemporaryBan: combineTypeData(TypeVariation.Ban, TypeMetadata.Temporary),
	TemporaryMute: combineTypeData(TypeVariation.Mute, TypeMetadata.Temporary),
	TemporaryRestrictedAttachment: combineTypeData(TypeVariation.RestrictedAttachment, TypeMetadata.Temporary),
	TemporaryRestrictedEmbed: combineTypeData(TypeVariation.RestrictedEmbed, TypeMetadata.Temporary),
	TemporaryRestrictedEmoji: combineTypeData(TypeVariation.RestrictedEmoji, TypeMetadata.Temporary),
	TemporaryRestrictedReaction: combineTypeData(TypeVariation.RestrictedReaction, TypeMetadata.Temporary),
	TemporaryRestrictedVoice: combineTypeData(TypeVariation.RestrictedVoice, TypeMetadata.Temporary),
	TemporaryRoleAdd: combineTypeData(TypeVariation.RoleAdd, TypeMetadata.Temporary),
	TemporaryRoleRemove: combineTypeData(TypeVariation.RoleRemove, TypeMetadata.Temporary),
	TemporarySetNickname: combineTypeData(TypeVariation.SetNickname, TypeMetadata.Temporary),
	TemporaryVoiceMute: combineTypeData(TypeVariation.VoiceMute, TypeMetadata.Temporary),
	TemporaryWarning: combineTypeData(TypeVariation.Warning, TypeMetadata.Temporary)
} as const;

export type TypeCodes = number & { __TYPE__: 'TypeCodes' };

const AllowedMetadataTypes = TypeMetadata.Undo | TypeMetadata.Temporary;
export function combineTypeData(type: TypeVariation, metadata?: TypeMetadata): TypeCodes {
	if (isNullishOrZero(metadata)) return type as TypeCodes;
	return (((metadata & AllowedMetadataTypes) << 5) | type) as TypeCodes;
}

export function isValidType(type: TypeVariation, metadata?: TypeMetadata): boolean {
	return Metadata.has(combineTypeData(type, metadata));
}

export function getColor(entry: ModerationManager.Entry): number {
	return Metadata.get(combineTypeData(entry.type, entry.metadata))!;
}

const Metadata = new Map<TypeCodes, Colors>([
	[TypeCodes.Ban, Colors.Red],
	[TypeCodes.Kick, Colors.Orange],
	[TypeCodes.Mute, Colors.Amber],
	[TypeCodes.RestrictedAttachment, Colors.Lime],
	[TypeCodes.RestrictedEmbed, Colors.Lime],
	[TypeCodes.RestrictedEmoji, Colors.Lime],
	[TypeCodes.RestrictedReaction, Colors.Lime],
	[TypeCodes.RestrictedVoice, Colors.Lime],
	[TypeCodes.RoleAdd, Colors.Lime],
	[TypeCodes.RoleRemove, Colors.Lime],
	[TypeCodes.SetNickname, Colors.Lime],
	[TypeCodes.SoftBan, Colors.DeepOrange],
	[TypeCodes.Timeout, Colors.Amber],
	[TypeCodes.VoiceKick, Colors.Orange],
	[TypeCodes.VoiceMute, Colors.Amber],
	[TypeCodes.Warning, Colors.Yellow],
	[TypeCodes.UndoBan, Colors.LightBlue],
	[TypeCodes.UndoMute, Colors.LightBlue],
	[TypeCodes.UndoRestrictedAttachment, Colors.LightBlue],
	[TypeCodes.UndoRestrictedEmbed, Colors.LightBlue],
	[TypeCodes.UndoRestrictedEmoji, Colors.LightBlue],
	[TypeCodes.UndoRestrictedReaction, Colors.LightBlue],
	[TypeCodes.UndoRestrictedVoice, Colors.LightBlue],
	[TypeCodes.UndoRoleAdd, Colors.LightBlue],
	[TypeCodes.UndoRoleRemove, Colors.LightBlue],
	[TypeCodes.UndoSetNickname, Colors.LightBlue],
	[TypeCodes.UndoTimeout, Colors.LightBlue],
	[TypeCodes.UndoVoiceMute, Colors.LightBlue],
	[TypeCodes.UndoWarning, Colors.LightBlue],
	[TypeCodes.TemporaryBan, Colors.Red300],
	[TypeCodes.TemporaryMute, Colors.Amber300],
	[TypeCodes.TemporaryRestrictedAttachment, Colors.Lime300],
	[TypeCodes.TemporaryRestrictedEmbed, Colors.Lime300],
	[TypeCodes.TemporaryRestrictedEmoji, Colors.Lime300],
	[TypeCodes.TemporaryRestrictedReaction, Colors.Lime300],
	[TypeCodes.TemporaryRestrictedVoice, Colors.Lime300],
	[TypeCodes.TemporaryRoleAdd, Colors.Lime300],
	[TypeCodes.TemporaryRoleRemove, Colors.Lime300],
	[TypeCodes.TemporarySetNickname, Colors.Lime300],
	[TypeCodes.TemporaryVoiceMute, Colors.Amber300],
	[TypeCodes.TemporaryWarning, Colors.Yellow300]
]) as ReadonlyMap<TypeCodes, Colors>;
