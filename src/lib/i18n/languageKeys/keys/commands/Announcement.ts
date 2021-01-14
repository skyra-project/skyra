import { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const AnnouncementHeader = FT<{ role: string }, string>('commands/announcement:announcementHeader');
export const AnnouncementCancelled = T<string>('commands/announcement:announcementCancelled');
export const AnnouncementDescription = T<string>('commands/announcement:announcementDescription');
export const AnnouncementEmbedMentions = FT<{ header: string }, string>('commands/announcement:announcementEmbedMentions');
export const AnnouncementEmbedMentionsWithMentions = FT<{ header: string; mentions: string[] }, string>(
	'commands/announcement:announcementEmbedMentionsWithMentions'
);
export const AnnouncementExtended = T<LanguageHelpDisplayOptions>('commands/announcement:announcementExtended');
export const AnnouncementPrompt = T<string>('commands/announcement:announcementPrompt');
export const AnnouncementSuccess = T<string>('commands/announcement:announcementSuccess');
export const SubscribeDescription = T<string>('commands/announcement:subscribeDescription');
export const SubscribeExtended = T<LanguageHelpDisplayOptions>('commands/announcement:subscribeExtended');
export const SubscribeNoChannel = T<string>('commands/announcement:subscribeNoChannel');
export const SubscribeNoRole = T<string>('commands/announcement:subscribeNoRole');
export const SubscribeSuccess = FT<{ role: string }, string>('commands/announcement:subscribeSuccess');
export const UnsubscribeDescription = T<string>('commands/announcement:unsubscribeDescription');
export const UnsubscribeExtended = T<LanguageHelpDisplayOptions>('commands/announcement:unsubscribeExtended');
export const UnsubscribeSuccess = FT<{ role: string }, string>('commands/announcement:unsubscribeSuccess');
