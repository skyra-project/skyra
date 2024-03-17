import { FT, T } from '#lib/types';

export const TypeBan = T('moderation:typeBan');
export const TypeKick = T('moderation:typeKick');
export const TypeMute = T('moderation:typeMute');
export const TypeRestrictedAttachment = T('moderation:typeRestrictedAttachment');
export const TypeRestrictedEmbed = T('moderation:typeRestrictedEmbed');
export const TypeRestrictedEmoji = T('moderation:typeRestrictedEmoji');
export const TypeRestrictedReaction = T('moderation:typeRestrictedReaction');
export const TypeRestrictedVoice = T('moderation:typeRestrictedVoice');
export const TypeRoleAdd = T('moderation:typeAddRole');
export const TypeRoleRemove = T('moderation:typeRemoveRole');
export const TypeSetNickname = T('moderation:typeSetNickname');
export const TypeSoftban = T('moderation:typeSoftban');
export const TypeTimeout = T('moderation:typeTimeout');
export const TypeVoiceKick = T('moderation:typeVoiceKick');
export const TypeVoiceMute = T('moderation:typeVoiceMute');
export const TypeWarning = T('moderation:typeWarning');

export const MetadataUndo = FT<{ name: string }>('moderation:metadataUndo');
export const MetadataTemporary = FT<{ name: string }>('moderation:metadataTemporary');

export const EmbedUser = FT<{ tag: string; id: string }>('moderation:embedUser');
export const EmbedDescription = FT<{ type: string; user: string; reason: string }>('moderation:embedDescription');
export const EmbedReasonNotSet = FT<{ command: string; caseId: number }>('moderation:embedReasonNotSet');
export const EmbedFooter = FT<{ caseId: number }>('moderation:embedFooter');
