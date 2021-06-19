import { T } from '#lib/types';

export * as Ignore from './channels/Ignore';
export * as Logs from './channels/Logs';

export const Announcements = T<string>('settings:channelsAnnouncements');
export const Farewell = T<string>('settings:channelsFarewell');
export const Greeting = T<string>('settings:channelsGreeting');
export const Spam = T<string>('settings:channelsSpam');
