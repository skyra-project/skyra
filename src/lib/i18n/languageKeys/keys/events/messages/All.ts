import { FT, T } from '#lib/types';
import type { ChannelMention, UserMention } from 'discord.js';

export const MessageUpdate = FT<{ channel: `#${string}` }>('events/messages:messageUpdate');
export const MessageUpdateUnknown = FT<{ channel: `#${string}` }>('events/messages:messageUpdateUnknown');
export const MessageDelete = FT<{ channel: `#${string}` }>('events/messages:messageDelete');
export const MessageDeleteUnknown = FT<{ channel: `#${string}` }>('events/messages:messageDeleteUnknown');
export const MessageNotFound = T('events/messages:messageNotFound');
export const MessageDeleteBulk = FT<{ author: UserMention; channel: ChannelMention; count: number }>('events/messages:messageDeleteBulk');
export const MessageDeleteBulkUnknown = FT<{ channel: ChannelMention; count: number }>('events/messages:messageDeleteBulkUnknown');
export const MessageDeleteBulkFooter = T('events/messages:messageDeleteBulkFooter');
export const JumpToContext = T('events/messages:jumpToContext');
