import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const YoutubeSubscribeDescription = T('commands/notifications:youtubeSubscribeDescription');
export const YoutubeSubscribeExtended = T<LanguageHelpDisplayOptions>('commands/notifications:youtubeSubscribeExtended');
export const YoutubeSubscribeSuccess = FT<{ url: string }>('commands/notifications:youtubeSubscribeSuccess');
export const YoutubeSubscribeFailed = FT<{ url: string }>('commands/notifications:youtubeSubscribeFailed');
export const YoutubeSubscribeDefaultContent = T('commands/notifications:youtubeSubscribeDefaultContent');
export const YoutubeUnsubscribeDescription = T('commands/notifications:youtubeUnsubscribeDescription');
export const YoutubeUnsubscribeExtended = T<LanguageHelpDisplayOptions>('commands/notifications:youtubeUnsubscribeExtended');
export const YoutubeUnsubscribeSuccess = FT<{ url: string }>('commands/notifications:youtubeUnsubscribeSuccess');
export const YoutubeUnsubscribeFailed = FT<{ url: string }>('commands/notifications:youtubeUnsubscribeFailed');
export const YoutubeInvalidChannel = FT<{ url: string }>('commands/notifications:youtubeInvalidChannel');
export const YoutubeSubscriptionsDescription = T('commands/notifications:youtubeSubscriptionsDescription');
export const YoutubeSubscriptionsExtended = T<LanguageHelpDisplayOptions>('commands/notifications:youtubeSubscriptionsExtended');
export const YoutubeSubscriptionsFailed = T('commands/notifications:youtubeSubscriptionsFailed');
export const YoutubeSubscriptionsEmpty = T('commands/notifications:youtubeSubscriptionsEmpty');
