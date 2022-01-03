import { FT } from '#lib/types';

export const AfkRemove = FT<{ user: string }>('events/messages:afkRemove');
export const AfkStatus = FT<{ user: string; duration: number; content: string }>('events/messages:afkStatus');
export const MessageUpdate = FT<{ channel: `#${string}` }>('events/messages:messageUpdate');
export const MessageDelete = FT<{ channel: `#${string}` }>('events/messages:messageDelete');
