import { FT, T } from '@lib/types';

export const Time = T<string>('giveawayTime');
export const TimeTooLong = T<string>('giveawayTimeTooLong');
export const EndsAt = T<string>('giveawayEndsAt');
export const Duration = FT<{ time: number }, string>('giveawayDuration');
export const Title = T<string>('giveawayTitle');
export const Lastchance = FT<{ time: number }, string>('giveawayLastchance');
export const LastchanceTitle = T<string>('giveawayLastchanceTitle');
export const Ended = FT<{ winners: string; count: number }, string>('giveawayEnded');
export const EndedPlural = FT<{ winners: string; count: number }, string>('giveawayEndedPlural');
export const EndedNoWinner = T<string>('giveawayEndedNoWinner');
export const EndedAt = T<string>('giveawayEndedAt');
export const EndedTitle = T<string>('giveawayEndedTitle');
export const EndedMessage = FT<{ winners: readonly string[]; title: string }, string>('giveawayEndedMessage');
export const EndedMessageNoWinner = FT<{ title: string }, string>('giveawayEndedMessageNoWinner');
export const Scheduled = FT<{ scheduledTime: number }, string>('giveawayScheduled');
