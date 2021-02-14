import { FT, T } from '#lib/types';
import type { User } from 'discord.js';

export const Alert = T<string>('events/noMentionSpam:alert');
export const Footer = T<string>('events/noMentionSpam:footer');
export const Message = FT<{ user: User }, string>('events/noMentionSpam:message');
export const ModerationLog = FT<{ threshold: number }, string>('events/noMentionSpam:modlog');
