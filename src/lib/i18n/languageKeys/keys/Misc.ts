import { FT, T } from '#lib/types';

export const ConfigurationEquals = T<string>('commands/management:configurationEquals');
export const JumpTo = T<string>('system:jumpTo');
export const PrefixReminder = FT<{ prefix: string }, string>('system:prefixReminder');
export const RestrictionNotConfigured = T<string>('moderation:restrictionNotConfigured');
export const UnexpectedIssue = T<string>('errors:unexpectedIssue');
export const UserNotInGuild = T<string>('errors:userNotInGuild');
