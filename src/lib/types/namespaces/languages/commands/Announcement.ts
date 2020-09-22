import { T } from '@lib/types/Shared';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const Announcement = T<(params: { role: string }) => string>('commandAnnouncement');
export const AnnouncementCancelled = T<string>('commandAnnouncementCancelled');
export const AnnouncementDescription = T<string>('commandAnnouncementDescription');
export const AnnouncementEmbedMentions = T<(params: { header: string }) => string>('commandAnnouncementEmbedMentions');
export const AnnouncementEmbedMentionsWithMentions = T<(params: { header: string; mentions: string }) => string>(
	'commandAnnouncementEmbedMentionsWithMentions'
);
export const AnnouncementExtended = T<LanguageHelpDisplayOptions>('commandAnnouncementExtended');
export const AnnouncementPrompt = T<string>('commandAnnouncementPrompt');
export const AnnouncementSuccess = T<string>('commandAnnouncementSuccess');
export const SubscribeDescription = T<string>('commandSubscribeDescription');
export const SubscribeExtended = T<LanguageHelpDisplayOptions>('commandSubscribeExtended');
export const SubscribeNoChannel = T<string>('commandSubscribeNoChannel');
export const SubscribeNoRole = T<string>('commandSubscribeNoRole');
export const SubscribeSuccess = T<(params: { role: string }) => string>('commandSubscribeSuccess');
export const UnsubscribeDescription = T<string>('commandUnsubscribeDescription');
export const UnsubscribeExtended = T<LanguageHelpDisplayOptions>('commandUnsubscribeExtended');
export const UnsubscribeSuccess = T<(params: { role: string }) => string>('commandUnsubscribeSuccess');
