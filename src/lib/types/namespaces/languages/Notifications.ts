import { FT, T } from '#lib/types';

export const TwitchNoGameName = T<string>('notificationsTwitchNoGameName');
export const TwitchEmbedDescription = FT<{ userName: string }, string>('notificationsTwitchEmbedDescription');
export const TwitchEmbedDescriptionWithGame = FT<{ userName: string; gameName: string }, string>('notificationsTwitchEmbedDescriptionWithGame');
export const TwitchEmbedFooter = T<string>('notificationTwitchEmbedFooter');
