import { FT } from '#lib/types';
import type { Message, TextChannel } from 'discord.js';

export const AfkRemove = FT<{ user: string }>('events/messages:afkRemove');
export const AfkStatus = FT<{ user: string; duration: number; content: string }>('events/messages:afkStatus');
export const MessageUpdate = FT<{ message: Message }>('events/messages:messageUpdate');
export const MessageDelete = FT<{ channel: TextChannel }>('events/messages:messageDelete');
