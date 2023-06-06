import { FT, T } from '#lib/types';

export const Alert = T<string>('events/noMentionSpam:alert');
export const Footer = T<string>('events/noMentionSpam:footer');
export const Message = FT<{ userId: string; userTag: string }, string>('events/noMentionSpam:message');
export const ModerationLog = FT<{ threshold: number }, string>('events/noMentionSpam:modlog');
