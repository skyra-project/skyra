import { FT, T } from '#lib/types';

export const NoGameName = T<string>('events/twitch:noGameName');
export const EmbedDescription = FT<{ userName: string }, string>('events/twitch:embedDescription');
export const EmbedDescriptionWithGame = FT<{ userName: string; gameName: string }, string>('events/twitch:embedDescriptionWithGame');
export const EmbedFooter = T<string>('events/twitch:embedFooter');
