import { FT } from '#lib/types';
import type { GuildTextBasedChannel } from 'discord.js';

export const AfkRemove = FT<{ user: string }>('events/messages:afkRemove');
export const AfkStatus = FT<{ user: string; duration: number; content: string }>('events/messages:afkStatus');
export const MessageUpdate = FT<{ channel: GuildTextBasedChannel }>('events/messages:messageUpdate');
export const MessageDelete = FT<{ channel: GuildTextBasedChannel }>('events/messages:messageDelete');
