import { FT, T } from '#lib/types';

export const Reaction = T<string>('events/reactions:reaction');
export const Filter = FT<{ user: string }, string>('events/reactions:filter');
export const FilterFooter = T<string>('events/reactions:filterFooter');
