import { FT, T } from '#lib/types';

export const ReactionDescription = FT<{ emoji: string; message: string }>('events/reactions:reactionDescription');
export const ReactionFooter = T('events/reactions:reactionFooter');
export const Filter = FT<{ user: string }>('events/reactions:filter');
export const FilterFooter = T('events/reactions:filterFooter');
export const SelfRoleHierarchy = T('events/reactions:selfRoleHierarchy');
