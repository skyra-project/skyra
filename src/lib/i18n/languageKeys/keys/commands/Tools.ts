import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';
import type { GuildMember, User } from 'discord.js';

export const AvatarDescription = T('commands/tools:avatarDescription');
export const AvatarExtended = T<LanguageHelpDisplayOptions>('commands/tools:avatarExtended');
export const AvatarNone = T('commands/tools:avatarNone');
export const VoteDescription = T('commands/tools:voteDescription');
export const VoteExtended = T<LanguageHelpDisplayOptions>('commands/tools:voteExtended');
export const VoteContentNeeded = T('commands/tools:voteContentNeeded');
export const VoteReactionBlocked = T('commands/tools:voteReactionBlocked');
export const WhoisDescription = T('commands/tools:whoisDescription');
export const WhoisExtended = T<LanguageHelpDisplayOptions>('commands/tools:whoisExtended');
export const WhoisMemberTitles = T<{ joined: string; createdAt: string }>('commands/tools:whoisMemberTitles');
export const WhoisMemberFields = FT<
	{
		member: GuildMember;
		memberCreatedAt: string;
		memberCreatedAtOffset: string;
		memberJoinedAt: string;
		memberJoinedAtOffset: string;
	},
	{
		joinedUnknown: string;
		joinedWithTimestamp: string;
		createdAt: string;
		footer: string;
	}
>('commands/tools:whoisMemberFields');
export const WhoisMemberRoles = FT<{ count: number }, string>('commands/tools:whoisMemberRoles');
export const WhoisMemberRoleListAndMore = FT<{ count: number }, string>('commands/tools:whoisMemberRoleListAndMore');
export const WhoisMemberPermissions = T('commands/tools:whoisMemberPermissions');
export const WhoisMemberPermissionsAll = T('commands/tools:whoisMemberPermissionsAll');
export const WhoisUserTitles = T<{
	createdAt: string;
}>('commands/tools:whoisUserTitles');
export const WhoisUserFields = FT<
	{
		user: User;
		userCreatedAt: string;
		userCreatedAtOffset: string;
	},
	{
		createdAt: string;
		footer: string;
	}
>('commands/tools:whoisUserFields');
