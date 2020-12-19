import { FT, T } from '#lib/types';
import type { User } from 'discord.js';

export const CommandHandlerReprompt = FT<{ tag: string; name: string; time: string; cancelOptions: string }, string>(
	'monitor:commandHandlerReprompt'
);
export const CommandHandlerRepeatingReprompt = FT<{ tag: string; name: string; time: string; cancelOptions: string }, string>(
	'monitor:commandHandlerRepeatingReprompt'
);
export const AttachmentFilterFooter = T<string>('monitor:attachmentFilter');
export const AttachmentFilter = FT<{ user: string }, string>('monitor:attachmentFilter');
export const CapsFilter = FT<{ user: string }, string>('monitor:capsFilter');
export const CapsFilterDm = FT<{ message: string }, string>('monitor:capsFilterDm');
export const CapsFilterFooter = T<string>('monitor:capsFilterFooter');
export const CommandHandlerAborted = T<string>('monitor:commandHandlerAborted');
export const InviteFilterAlert = FT<{ user: string }, string>('monitor:inviteFilterAlert');
export const InviteFilterLog = FT<{ links: readonly string[]; count: number }, string>('monitor:inviteFilterLog');
export const InviteFilterLogPlural = FT<{ links: readonly string[]; count: number }, string>('monitor:inviteFilterLogPlural');
export const InviteFooter = T<string>('monitor:inviteLink');
export const LinkFooter = T<string>('monitor:link');
export const MessageFilter = FT<{ user: string }, string>('monitor:messageFilter');
export const ModerationAttachments = T<string>('monitor:attachments');
export const ModerationAttachmentsWithMaximum = FT<{ amount: number; maximum: number }, string>('monitor:attachmentsWithMaximum');
export const ModerationCapitals = T<string>('monitor:capitals');
export const ModerationCapitalsWithMaximum = FT<{ amount: number; maximum: number }, string>('monitor:capitalsWithMaximum');
export const ModerationInvites = T<string>('monitor:invites');
export const ModerationInvitesWithMaximum = FT<{ amount: number; maximum: number }, string>('monitor:invitesWithMaximum');
export const ModerationLinks = T<string>('monitor:links');
export const ModerationLinksWithMaximum = FT<{ amount: number; maximum: number }, string>('monitor:linksWithMaximum');
export const ModerationMessages = T<string>('monitor:messages');
export const ModerationMessagesWithMaximum = FT<{ amount: number; maximum: number }, string>('monitor:messagesWithMaximum');
export const ModerationNewLine = T<string>('monitor:newlines');
export const ModerationNewLineWithMaximum = FT<{ amount: number; maximum: number }, string>('monitor:newlinesWithMaximum');
export const ModerationWords = T<string>('monitor:words');
export const ModerationWordsWithMaximum = FT<{ amount: number; maximum: number }, string>('monitor:wordsWithMaximum');
export const NewLineFilter = FT<{ user: string }, string>('monitor:newlineFilter');
export const NmsAlert = T<string>('monitor:nmsAlert');
export const NmsFooter = T<string>('monitor:nms');
export const NmsMessage = FT<{ user: User }, string[]>('monitor:nmsMessage');
export const NmsModlog = FT<{ threshold: number }, string>('monitor:nmsModlog');
export const LinkMissing = FT<{ user: string }, string>('monitor:nolink');
export const ReactionsFilter = FT<{ user: string }, string>('monitor:reactionsFilter');
export const ReactionsFilterFooter = T<string>('monitor:reactionFilterFooter');
export const SocialAchievement = T<string>('monitor:socialAchievement');
export const WordFilter = FT<{ user: string }, string>('monitor:wordFilter');
export const WordFilterDm = FT<{ filtered: string }, string>('monitor:wordFilterDm');
export const WordFooter = T<string>('monitor:wordFilterFooter');
export const MessageFooter = T<string>('monitor:messageFilterFooter');
export const NewLineFooter = T<string>('monitor:newlineFilterFooter');
