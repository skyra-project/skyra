import { FT, T } from '#lib/types';

export const TwitchNoGameName = T<string>('notifications:twitchNoGameName');
export const TwitchEmbedDescription = FT<{ userName: string }, string>('notifications:twitchEmbedDescription');
export const TwitchEmbedDescriptionWithGame = FT<{ userName: string; gameName: string }, string>('notifications:twitchEmbedDescriptionWithGame');
export const TwitchEmbedFooter = T<string>('notifications:twitchEmbedFooter');
