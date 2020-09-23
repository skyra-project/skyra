import { FT, T } from '@lib/types/Shared';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const Announcement = FT<{ role: string }, string>('commandAnnouncement');
export const AnnouncementCancelled = T<string>('commandAnnouncementCancelled');
export const AnnouncementDescription = T<string>('commandAnnouncementDescription');
export const AnnouncementEmbedMentions = FT<{ header: string }, string>('commandAnnouncementEmbedMentions');
export const AnnouncementEmbedMentionsWithMentions = FT<{ header: string; mentions: string }, string>('commandAnnouncementEmbedMentionsWithMentions');
export const AnnouncementExtended = T<LanguageHelpDisplayOptions>('commandAnnouncementExtended');
export const AnnouncementPrompt = T<string>('commandAnnouncementPrompt');
export const AnnouncementSuccess = T<string>('commandAnnouncementSuccess');
export const SubscribeDescription = T<string>('commandSubscribeDescription');
export const SubscribeExtended = T<LanguageHelpDisplayOptions>('commandSubscribeExtended');
export const SubscribeNoChannel = T<string>('commandSubscribeNoChannel');
export const SubscribeNoRole = T<string>('commandSubscribeNoRole');
export const SubscribeSuccess = FT<{ role: string }, string>('commandSubscribeSuccess');
export const UnsubscribeDescription = T<string>('commandUnsubscribeDescription');
export const UnsubscribeExtended = T<LanguageHelpDisplayOptions>('commandUnsubscribeExtended');
export const UnsubscribeSuccess = FT<{ role: string }, string>('commandUnsubscribeSuccess');
