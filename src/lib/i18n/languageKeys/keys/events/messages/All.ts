import { FT } from '#lib/types';
import type { Message, TextChannel } from 'discord.js';

export const MessageUpdate = FT<{ message: Message }, string>('events/messages:messageUpdate');
export const MessageDelete = FT<{ channel: TextChannel }, string>('events/messages:messageDelete');
