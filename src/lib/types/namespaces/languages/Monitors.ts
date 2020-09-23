import { T } from '@lib/types/Shared';
import { User } from 'discord.js';

export const CommandHandlerReprompt = T<(params: { tag: string; name: string; time: string; cancelOptions: string }) => string>(
	'monitorCommandHandlerReprompt'
);
export const CommandHandlerRepeatingReprompt = T<(params: { tag: string; name: string; time: string; cancelOptions: string }) => string>(
	'monitorCommandHandlerRepeatingReprompt'
);
export const CommandHandlerAborted = T<string>('monitorCommandHandlerAborted');
export const InviteFilterAlert = T<(params: { user: string }) => string>('monitorInviteFilterAlert');
export const InviteFilterLog = T<(params: { links: readonly string[]; count: number }) => string>('monitorInviteFilterLog');
export const InviteFilterLogPlural = T<(params: { links: readonly string[]; count: number }) => string>('monitorInviteFilterLogPlural');
export const Nolink = T<(params: { user: string }) => string>('monitorNolink');
export const WordFilterDm = T<(params: { filtered: string }) => string>('monitorWordFilterDm');
export const CapsFilterDm = T<(params: { message: string }) => string>('monitorCapsFilterDm');
export const WordFilter = T<(params: { user: string }) => string>('monitorWordFilter');
export const CapsFilter = T<(params: { user: string }) => string>('monitorCapsFilter');
export const MessageFilter = T<(params: { user: string }) => string>('monitorMessageFilter');
export const NewlineFilter = T<(params: { user: string }) => string>('monitorNewlineFilter');
export const ReactionsFilter = T<(params: { user: string }) => string>('monitorReactionsFilter');
export const NmsMessage = T<(params: { user: User }) => string[]>('monitorNmsMessage');
export const NmsModlog = T<(params: { threshold: number }) => string>('monitorNmsModlog');
export const NmsAlert = T<string>('monitorNmsAlert');
export const SocialAchievement = T<string>('monitorSocialAchievement');
export const InvitelinkFooter = T<string>('constMonitorInvitelink');
export const LinkFooter = T<string>('constMonitorLink');
export const NmsFooter = T<string>('constMonitorNms');
export const WordfilterFooter = T<string>('constMonitorWordfilter');
export const CapsfilterFooter = T<string>('constMonitorCapsfilter');
export const AttachmentfilterFooter = T<string>('constMonitorAttachmentfilter');
export const ReactionfilterFooter = T<string>('constMonitorReactionfilter');
export const ModerationAttachments = T<string>('moderationMonitorAttachments');
export const ModerationAttachmentsWithMaximum = T<(params: { amount: number; maximum: number }) => string>('moderationMonitorAttachmentsWithMaximum');
export const ModerationCapitals = T<string>('moderationMonitorCapitals');
export const ModerationCapitalsWithMaximum = T<(params: { amount: number; maximum: number }) => string>('moderationMonitorCapitalsWithMaximum');
export const ModerationInvites = T<string>('moderationMonitorInvites');
export const ModerationInvitesWithMaximum = T<(params: { amount: number; maximum: number }) => string>('moderationMonitorInvitesWithMaximum');
export const ModerationLinks = T<string>('moderationMonitorLinks');
export const ModerationLinksWithMaximum = T<(params: { amount: number; maximum: number }) => string>('moderationMonitorLinksWithMaximum');
export const ModerationMessages = T<string>('moderationMonitorMessages');
export const ModerationMessagesWithMaximum = T<(params: { amount: number; maximum: number }) => string>('moderationMonitorMessagesWithMaximum');
export const ModerationNewlines = T<string>('moderationMonitorNewlines');
export const ModerationNewlinesWithMaximum = T<(params: { amount: number; maximum: number }) => string>('moderationMonitorNewlinesWithMaximum');
export const ModerationWords = T<string>('moderationMonitorWords');
export const ModerationWordsWithMaximum = T<(params: { amount: number; maximum: number }) => string>('moderationMonitorWordsWithMaximum');
