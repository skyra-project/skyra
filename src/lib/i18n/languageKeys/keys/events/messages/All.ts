import { FT } from '#lib/types';

export const MessageUpdate = FT<{ channel: `#${string}` }>('events/messages:messageUpdate');
export const MessageDelete = FT<{ channel: `#${string}` }>('events/messages:messageDelete');
