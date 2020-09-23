import { T } from '@lib/types/Shared';

export const TwitchNoGameName = T<string>('notificationsTwitchNoGameName');
export const TwitchEmbedDescription = T<(params: { userName: string }) => string>('notificationsTwitchEmbedDescription');
export const TwitchEmbedDescriptionWithGame = T<(params: { userName: string; gameName: string }) => string>(
	'notificationsTwitchEmbedDescriptionWithGame'
);
export const TwitchEmbedFooter = T<string>('notificationTwitchEmbedFooter');
