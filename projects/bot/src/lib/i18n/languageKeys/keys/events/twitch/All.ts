import { FT, T } from '#lib/types';

export const EmbedDescription = FT<{ userName: string }, string>('events/twitch:embedDescription');
export const EmbedDescriptionWithGame = FT<{ userName: string; gameName: string }, string>('events/twitch:embedDescriptionWithGame');
export const OfflinePostfix = T<string>('events/twitch:offlinePostfix');
