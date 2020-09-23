import { T } from '@lib/types/Shared';

export const Time = T<string>('giveawayTime');
export const TimeTooLong = T<string>('giveawayTimeTooLong');
export const EndsAt = T<string>('giveawayEndsAt');
export const Duration = T<(params: { time: number }) => string>('giveawayDuration');
export const Title = T<string>('giveawayTitle');
export const Lastchance = T<(params: { time: number }) => string>('giveawayLastchance');
export const LastchanceTitle = T<string>('giveawayLastchanceTitle');
export const Ended = T<(params: { winners: string; count: number }) => string>('giveawayEnded');
export const EndedPlural = T<(params: { winners: string; count: number }) => string>('giveawayEndedPlural');
export const EndedNoWinner = T<string>('giveawayEndedNoWinner');
export const EndedAt = T<string>('giveawayEndedAt');
export const EndedTitle = T<string>('giveawayEndedTitle');
export const EndedMessage = T<(params: { winners: readonly string[]; title: string }) => string>('giveawayEndedMessage');
export const EndedMessageNoWinner = T<(params: { title: string }) => string>('giveawayEndedMessageNoWinner');
export const Scheduled = T<(params: { scheduledTime: number }) => string>('giveawayScheduled');
