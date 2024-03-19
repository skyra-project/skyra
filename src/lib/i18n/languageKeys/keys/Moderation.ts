import { FT, T } from '#lib/types';

export const TypeBan = T('moderation:typeBan');
export const TypeKick = T('moderation:typeKick');
export const TypeMute = T('moderation:typeMute');
export const TypeRestrictedAttachment = T('moderation:typeRestrictedAttachment');
export const TypeRestrictedEmbed = T('moderation:typeRestrictedEmbed');
export const TypeRestrictedEmoji = T('moderation:typeRestrictedEmoji');
export const TypeRestrictedReaction = T('moderation:typeRestrictedReaction');
export const TypeRestrictedVoice = T('moderation:typeRestrictedVoice');
export const TypeRoleAdd = T('moderation:typeRoleAdd');
export const TypeRoleRemove = T('moderation:typeRoleRemove');
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
export const EmbedDescriptionTemporary = FT<{ type: string; user: string; time: string; reason: string }>('moderation:embedDescriptionTemporary');
export const EmbedReasonNotSet = FT<{ command: string; caseId: number }>('moderation:embedReasonNotSet');
export const EmbedFooter = FT<{ caseId: number }>('moderation:embedFooter');

// Action status
export const ActionIsActive = T('moderation:actionIsActive');
export const ActionIsNotActive = T('moderation:actionIsNotActive');

// Action status overrides
export const ActionIsActiveRole = T('moderation:actionIsActiveRole');
export const ActionIsNotActiveRole = T('moderation:actionIsNotActiveRole');
export const ActionIsActiveRestrictionRole = T('moderation:actionIsActiveRestrictionRole');
export const ActionIsNotActiveRestrictionRole = T('moderation:actionIsNotActiveRestrictionRole');
export const ActionIsActiveNickname = T('moderation:actionIsActiveNickname');
export const ActionIsNotActiveNickname = T('moderation:actionIsNotActiveNickname');

export const ActionTargetSelf = T('moderation:actionTargetSelf');
export const ActionTargetSkyra = T('moderation:actionTargetSkyra');
export const ActionTargetHigherHierarchySkyra = T('moderation:actionTargetHigherHierarchySkyra');
export const ActionTargetHigherHierarchyAuthor = T('moderation:actionTargetHigherHierarchyAuthor');
