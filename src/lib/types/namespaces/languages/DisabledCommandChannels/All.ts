import { FT, T } from '#lib/types';

export const ChannelDoesNotExist = T<string>('serializerDisabledCommandChannelsChannelsDoesNotExist');
export const CommandDoesNotExist = FT<{ name: string }, string>('serializerDisabledCommandChannelsChannelsCommandDoesNotExist');
