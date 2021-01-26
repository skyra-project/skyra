import { FT, T } from '#lib/types';

export const ChannelNotReadable = T<string>('errors:channelNotReadable');
export const ConfigurationEquals = T<string>('commands/management:configurationEquals');
export const ConfigurationTextChannelRequired = T<string>('commands/management:configurationTextChannelRequired');
export const JumpTo = T<string>('system:jumpTo');
export const MessagePromptTimeout = T<string>('system:messagePromptTimeout');
export const PrefixReminder = FT<{ prefix: string }, string>('system:prefixReminder');
export const RestrictionNotConfigured = T<string>('moderation:restrictionNotConfigured');
export const SystemTextTruncated = FT<{ definition: string; url: string }, string>('commands/tools:systemTextTruncated');
export const TextPromptAbortOptions = T<readonly string[]>('system:textPromptAbortOptions');
export const UnexpectedIssue = T<string>('errors:unexpectedIssue');
export const UserNotExistent = T<string>('errors:userNotExistent');
export const UserNotInGuild = T<string>('errors:userNotInGuild');
