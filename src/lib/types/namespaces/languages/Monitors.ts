import { FT, T } from '#lib/types';
import type { User } from 'discord.js';

export const AttachmentFilter = FT<{ user: string }, string>('monitors:attachmentFilter');
export const AttachmentFilterFooter = T<string>('monitors:attachmentFilter');
export const CapsFilter = FT<{ user: string }, string>('monitors:capsFilter');
export const CapsFilterDm = FT<{ message: string }, string>('monitors:capsFilterDm');
export const CapsFilterFooter = T<string>('monitors:capsFilterFooter');
export const CommandHandlerAborted = T<string>('monitors:commandHandlerAborted');
export const CommandHandlerRepeatingReprompt = FT<{ tag: string; name: string; time: string; cancelOptions: string }, string>(
	'monitors:commandHandlerRepeatingReprompt'
);
export const CommandHandlerReprompt = FT<{ tag: string; name: string; time: string; cancelOptions: string }, string>(
	'monitors:commandHandlerReprompt'
);
export const InviteFilterAlert = FT<{ user: string }, string>('monitors:inviteFilterAlert');
export const InviteFilterLog = FT<{ links: readonly string[]; count: number }, string>('monitors:inviteFilterLog');
export const InviteFooter = T<string>('monitors:inviteLink');
export const LinkFooter = T<string>('monitors:link');
export const LinkMissing = FT<{ user: string }, string>('monitors:nolink');
export const MessageFilter = FT<{ user: string }, string>('monitors:messageFilter');
export const MessageFooter = T<string>('monitors:messageFilterFooter');
export const ModerationAttachments = T<string>('monitors:attachments');
export const ModerationAttachmentsWithMaximum = FT<{ amount: number; maximum: number }, string>('monitors:attachmentsWithMaximum');
export const ModerationCapitals = T<string>('monitors:capitals');
export const ModerationCapitalsWithMaximum = FT<{ amount: number; maximum: number }, string>('monitors:capitalsWithMaximum');
export const ModerationInvites = T<string>('monitors:invites');
export const ModerationInvitesWithMaximum = FT<{ amount: number; maximum: number }, string>('monitors:invitesWithMaximum');
export const ModerationLinks = T<string>('monitors:links');
export const ModerationLinksWithMaximum = FT<{ amount: number; maximum: number }, string>('monitors:linksWithMaximum');
export const ModerationMessages = T<string>('monitors:messages');
export const ModerationMessagesWithMaximum = FT<{ amount: number; maximum: number }, string>('monitors:messagesWithMaximum');
export const ModerationNewLine = T<string>('monitors:newlines');
export const ModerationNewLineWithMaximum = FT<{ amount: number; maximum: number }, string>('monitors:newlinesWithMaximum');
export const ModerationWords = T<string>('monitors:words');
export const ModerationWordsWithMaximum = FT<{ amount: number; maximum: number }, string>('monitors:wordsWithMaximum');
export const NewLineFilter = FT<{ user: string }, string>('monitors:newlineFilter');
export const NewLineFooter = T<string>('monitors:newlineFilterFooter');
export const NoMentionSpamAlert = T<string>('monitors:nmsAlert');
export const NoMentionSpamFooter = T<string>('monitors:nms');
export const NoMentionSpamMessage = FT<{ user: User }, string>('monitors:nmsMessage');
export const NoMentionSpamModerationLog = FT<{ threshold: number }, string>('monitors:nmsModlog');
export const ReactionsFilter = FT<{ user: string }, string>('monitors:reactionsFilter');
export const ReactionsFilterFooter = T<string>('monitors:reactionFilterFooter');
export const SocialAchievement = T<string>('monitors:socialAchievement');
export const WordFilter = FT<{ user: string }, string>('monitors:wordFilter');
export const WordFilterDm = FT<{ filtered: string }, string>('monitors:wordFilterDm');
export const WordFooter = T<string>('monitors:wordFilterFooter');
