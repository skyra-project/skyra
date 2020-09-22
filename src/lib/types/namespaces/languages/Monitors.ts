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
