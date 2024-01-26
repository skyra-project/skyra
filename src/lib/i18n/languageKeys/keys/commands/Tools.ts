import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const AvatarDescription = T('commands/tools:avatarDescription');
export const AvatarExtended = T<LanguageHelpDisplayOptions>('commands/tools:avatarExtended');
export const AvatarNone = T('commands/tools:avatarNone');
export const VoteDescription = T('commands/tools:voteDescription');
export const VoteExtended = T<LanguageHelpDisplayOptions>('commands/tools:voteExtended');
export const VoteContentNeeded = T('commands/tools:voteContentNeeded');
export const VoteReactionBlocked = T('commands/tools:voteReactionBlocked');
export const WhoisExtended = T<LanguageHelpDisplayOptions>('commands/tools:whoisExtended');
export const WhoisMemberRoleListAndMore = FT<{ count: number }, string>('commands/tools:whoisMemberRoleListAndMore');
