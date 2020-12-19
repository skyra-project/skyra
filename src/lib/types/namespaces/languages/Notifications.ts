import { FT, T } from '#lib/types';

export const TwitchNoGameName = T<string>('twitchNoGameName');
export const TwitchEmbedDescription = FT<{ userName: string }, string>('twitchEmbedDescription');
export const TwitchEmbedDescriptionWithGame = FT<{ userName: string; gameName: string }, string>('twitchEmbedDescriptionWithGame');
export const TwitchEmbedFooter = T<string>('twitchEmbedFooter');
