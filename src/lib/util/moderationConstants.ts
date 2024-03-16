import { Colors } from '#utils/constants';
import { isNullishOrZero } from '@sapphire/utilities';

export const enum TypeVariation {
	Ban,
	Kick,
	Mute,
	Softban,
	VoiceKick,
	VoiceMute,
	Warning,
	RestrictedReaction,
	RestrictedEmbed,
	RestrictedAttachment,
	RestrictedVoice,
	SetNickname,
	AddRole,
	RemoveRole,
	RestrictedEmoji,
	Timeout
}

export const enum TypeMetadata {
	None = 0,
	Undo = 1 << 0,
	Temporary = 1 << 1,
	Fast = 1 << 2,
	Archived = 1 << 3
}

const TypeCodes = {
	Warning: combineTypeData(TypeVariation.Warning),
	Mute: combineTypeData(TypeVariation.Mute),
	Timeout: combineTypeData(TypeVariation.Timeout),
	Kick: combineTypeData(TypeVariation.Kick),
	SoftBan: combineTypeData(TypeVariation.Softban),
	Ban: combineTypeData(TypeVariation.Ban),
	VoiceMute: combineTypeData(TypeVariation.VoiceMute),
	VoiceKick: combineTypeData(TypeVariation.VoiceKick),
	RestrictedAttachment: combineTypeData(TypeVariation.RestrictedAttachment),
	RestrictedReaction: combineTypeData(TypeVariation.RestrictedReaction),
	RestrictedEmbed: combineTypeData(TypeVariation.RestrictedEmbed),
	RestrictedEmoji: combineTypeData(TypeVariation.RestrictedEmoji),
	RestrictedVoice: combineTypeData(TypeVariation.RestrictedVoice),
	UnWarn: combineTypeData(TypeVariation.Warning, TypeMetadata.Undo),
	UnMute: combineTypeData(TypeVariation.Mute, TypeMetadata.Undo),
	UnTimeout: combineTypeData(TypeVariation.Timeout, TypeMetadata.Undo),
	UnBan: combineTypeData(TypeVariation.Ban, TypeMetadata.Undo),
	UnVoiceMute: combineTypeData(TypeVariation.VoiceMute, TypeMetadata.Undo),
	UnRestrictedReaction: combineTypeData(TypeVariation.RestrictedReaction, TypeMetadata.Undo),
	UnRestrictedEmbed: combineTypeData(TypeVariation.RestrictedEmbed, TypeMetadata.Undo),
	UnRestrictedEmoji: combineTypeData(TypeVariation.RestrictedEmoji, TypeMetadata.Undo),
	UnRestrictedAttachment: combineTypeData(TypeVariation.RestrictedAttachment, TypeMetadata.Undo),
	UnRestrictedVoice: combineTypeData(TypeVariation.RestrictedVoice, TypeMetadata.Undo),
	UnSetNickname: combineTypeData(TypeVariation.SetNickname, TypeMetadata.Undo),
	UnAddRole: combineTypeData(TypeVariation.AddRole, TypeMetadata.Undo),
	UnRemoveRole: combineTypeData(TypeVariation.RemoveRole, TypeMetadata.Undo),
	TemporaryWarning: combineTypeData(TypeVariation.Warning, TypeMetadata.Temporary),
	TemporaryMute: combineTypeData(TypeVariation.Mute, TypeMetadata.Temporary),
	TemporaryBan: combineTypeData(TypeVariation.Ban, TypeMetadata.Temporary),
	TemporaryVoiceMute: combineTypeData(TypeVariation.VoiceMute, TypeMetadata.Temporary),
	TemporaryRestrictedAttachment: combineTypeData(TypeVariation.RestrictedAttachment, TypeMetadata.Temporary),
	TemporaryRestrictedReaction: combineTypeData(TypeVariation.RestrictedReaction, TypeMetadata.Temporary),
	TemporaryRestrictedEmbed: combineTypeData(TypeVariation.RestrictedEmbed, TypeMetadata.Temporary),
	TemporaryRestrictedEmoji: combineTypeData(TypeVariation.RestrictedEmoji, TypeMetadata.Temporary),
	TemporaryRestrictedVoice: combineTypeData(TypeVariation.RestrictedVoice, TypeMetadata.Temporary),
	TemporarySetNickname: combineTypeData(TypeVariation.SetNickname, TypeMetadata.Temporary),
	TemporaryAddRole: combineTypeData(TypeVariation.AddRole, TypeMetadata.Temporary),
	TemporaryRemoveRole: combineTypeData(TypeVariation.RemoveRole, TypeMetadata.Temporary),
	FastTemporaryWarning: combineTypeData(TypeVariation.Warning, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryMute: combineTypeData(TypeVariation.Mute, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryBan: combineTypeData(TypeVariation.Ban, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryVoiceMute: combineTypeData(TypeVariation.VoiceMute, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryRestrictedAttachment: combineTypeData(TypeVariation.RestrictedAttachment, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryRestrictedReaction: combineTypeData(TypeVariation.RestrictedReaction, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryRestrictedEmbed: combineTypeData(TypeVariation.RestrictedEmbed, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryRestrictedEmoji: combineTypeData(TypeVariation.RestrictedEmoji, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryRestrictedVoice: combineTypeData(TypeVariation.RestrictedVoice, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporarySetNickname: combineTypeData(TypeVariation.SetNickname, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryAddRole: combineTypeData(TypeVariation.AddRole, TypeMetadata.Temporary | TypeMetadata.Fast),
	FastTemporaryRemoveRole: combineTypeData(TypeVariation.RemoveRole, TypeMetadata.Temporary | TypeMetadata.Fast),
	SetNickname: combineTypeData(TypeVariation.SetNickname),
	AddRole: combineTypeData(TypeVariation.AddRole),
	RemoveRole: combineTypeData(TypeVariation.RemoveRole)
} as const;

export type TypeCodes = number & { __TYPE__: 'TypeCodes' };

export function combineTypeData(type: TypeVariation, metadata?: TypeMetadata): TypeCodes {
	if (isNullishOrZero(metadata)) return type as TypeCodes;
	return (((metadata & ~TypeMetadata.Archived) << 5) | type) as TypeCodes;
}

export function hasMetadata(type: TypeVariation, metadata?: TypeMetadata): boolean {
	return Metadata.has(combineTypeData(type, metadata));
}

export function getMetadata(type: TypeVariation, metadata?: TypeMetadata): ModerationTypeAssets {
	return Metadata.get(combineTypeData(type, metadata))!;
}

const Metadata = new Map<TypeCodes, ModerationTypeAssets>([
	[TypeCodes.Warning, { color: Colors.Yellow, title: 'Warning' }],
	[TypeCodes.Mute, { color: Colors.Amber, title: 'Mute' }],
	[TypeCodes.Kick, { color: Colors.Orange, title: 'Kick' }],
	[TypeCodes.SoftBan, { color: Colors.DeepOrange, title: 'SoftBan' }],
	[TypeCodes.Ban, { color: Colors.Red, title: 'Ban' }],
	[TypeCodes.VoiceMute, { color: Colors.Amber, title: 'Voice Mute' }],
	[TypeCodes.VoiceKick, { color: Colors.Orange, title: 'Voice Kick' }],
	[TypeCodes.RestrictedReaction, { color: Colors.Lime, title: 'Reaction Restriction' }],
	[TypeCodes.RestrictedEmbed, { color: Colors.Lime, title: 'Embed Restriction' }],
	[TypeCodes.RestrictedEmoji, { color: Colors.Lime, title: 'Emoji Restriction' }],
	[TypeCodes.RestrictedAttachment, { color: Colors.Lime, title: 'Attachment Restriction' }],
	[TypeCodes.RestrictedVoice, { color: Colors.Lime, title: 'Voice Restriction' }],
	[TypeCodes.UnWarn, { color: Colors.LightBlue, title: 'Reverted Warning' }],
	[TypeCodes.UnMute, { color: Colors.LightBlue, title: 'Reverted Mute' }],
	[TypeCodes.UnBan, { color: Colors.LightBlue, title: 'Reverted Ban' }],
	[TypeCodes.UnVoiceMute, { color: Colors.LightBlue, title: 'Reverted Voice Mute' }],
	[TypeCodes.UnRestrictedReaction, { color: Colors.LightBlue, title: 'Reverted Reaction Restriction' }],
	[TypeCodes.UnRestrictedEmbed, { color: Colors.LightBlue, title: 'Reverted Embed Restriction' }],
	[TypeCodes.UnRestrictedEmoji, { color: Colors.LightBlue, title: 'Reverted Emoji Restriction' }],
	[TypeCodes.UnRestrictedAttachment, { color: Colors.LightBlue, title: 'Reverted Attachment Restriction' }],
	[TypeCodes.UnRestrictedVoice, { color: Colors.LightBlue, title: 'Reverted Voice Restriction' }],
	[TypeCodes.UnSetNickname, { color: Colors.LightBlue, title: 'Reverted Set Nickname' }],
	[TypeCodes.UnAddRole, { color: Colors.LightBlue, title: 'Reverted Add Role' }],
	[TypeCodes.UnRemoveRole, { color: Colors.LightBlue, title: 'Reverted Remove Role' }],
	[TypeCodes.TemporaryWarning, { color: Colors.Yellow300, title: 'Temporary Warning' }],
	[TypeCodes.TemporaryMute, { color: Colors.Amber300, title: 'Temporary Mute' }],
	[TypeCodes.TemporaryBan, { color: Colors.Red300, title: 'Temporary Ban' }],
	[TypeCodes.TemporaryVoiceMute, { color: Colors.Amber300, title: 'Temporary Voice Mute' }],
	[TypeCodes.TemporaryRestrictedReaction, { color: Colors.Lime300, title: 'Temporary Reaction Restriction' }],
	[TypeCodes.TemporaryRestrictedEmbed, { color: Colors.Lime300, title: 'Temporary Embed Restriction' }],
	[TypeCodes.TemporaryRestrictedEmoji, { color: Colors.Lime300, title: 'Temporary Emoji Restriction' }],
	[TypeCodes.TemporaryRestrictedAttachment, { color: Colors.Lime300, title: 'Temporary Attachment Restriction' }],
	[TypeCodes.TemporaryRestrictedVoice, { color: Colors.Lime300, title: 'Temporary Voice Restriction' }],
	[TypeCodes.TemporarySetNickname, { color: Colors.Lime300, title: 'Temporary Set Nickname' }],
	[TypeCodes.TemporaryAddRole, { color: Colors.Lime300, title: 'Temporarily Added Role' }],
	[TypeCodes.TemporaryRemoveRole, { color: Colors.Lime300, title: 'Temporarily Removed Role' }],
	[TypeCodes.FastTemporaryWarning, { color: Colors.Yellow300, title: 'Temporary Warning' }],
	[TypeCodes.FastTemporaryMute, { color: Colors.Amber300, title: 'Temporary Mute' }],
	[TypeCodes.FastTemporaryBan, { color: Colors.Red300, title: 'Temporary Ban' }],
	[TypeCodes.FastTemporaryVoiceMute, { color: Colors.Amber300, title: 'Temporary Voice Mute' }],
	[TypeCodes.FastTemporaryRestrictedReaction, { color: Colors.Lime300, title: 'Temporary Reaction Restriction' }],
	[TypeCodes.FastTemporaryRestrictedEmbed, { color: Colors.Lime300, title: 'Temporary Embed Restriction' }],
	[TypeCodes.FastTemporaryRestrictedEmoji, { color: Colors.Lime300, title: 'Temporary Emoji Restriction' }],
	[TypeCodes.FastTemporaryRestrictedAttachment, { color: Colors.Lime300, title: 'Temporary Attachment Restriction' }],
	[TypeCodes.FastTemporaryRestrictedVoice, { color: Colors.Lime300, title: 'Temporary Voice Restriction' }],
	[TypeCodes.FastTemporarySetNickname, { color: Colors.Lime300, title: 'Temporary Set Nickname' }],
	[TypeCodes.FastTemporaryAddRole, { color: Colors.Lime300, title: 'Temporarily Added Role' }],
	[TypeCodes.FastTemporaryRemoveRole, { color: Colors.Lime300, title: 'Temporarily Removed Role' }],
	[TypeCodes.SetNickname, { color: Colors.Lime, title: 'Set Nickname' }],
	[TypeCodes.AddRole, { color: Colors.Lime, title: 'Added Role' }],
	[TypeCodes.RemoveRole, { color: Colors.Lime, title: 'Removed Role' }]
]) as ReadonlyMap<TypeCodes, ModerationTypeAssets>;

export const enum TypeVariationAppealNames {
	Warning = 'moderationEndWarning',
	Mute = 'moderationEndMute',
	Ban = 'moderationEndBan',
	VoiceMute = 'moderationEndVoiceMute',
	RestrictedReaction = 'moderationEndRestrictionReaction',
	RestrictedEmbed = 'moderationEndRestrictionEmbed',
	RestrictedEmoji = 'moderationEndRestrictionEmoji',
	RestrictedAttachment = 'moderationEndRestrictionAttachment',
	RestrictedVoice = 'moderationEndRestrictionVoice',
	SetNickname = 'moderationEndSetNickname',
	AddRole = 'moderationEndAddRole',
	RemoveRole = 'moderationEndRemoveRole'
}

export const enum SchemaKeys {
	Case = 'caseID',
	CreatedAt = 'createdAt',
	Duration = 'duration',
	ExtraData = 'extraData',
	Guild = 'guildID',
	Moderator = 'moderatorID',
	Reason = 'reason',
	ImageURL = 'imageURL',
	Type = 'type',
	User = 'userID'
}

export interface ModerationTypeAssets {
	color: number;
	title: string;
}

export interface ModerationManagerDescriptionData {
	reason: string | null;
	prefix: string;
	caseId: number;
	formattedDuration: string;
}

export interface Unlock {
	unlock(): void;
}
