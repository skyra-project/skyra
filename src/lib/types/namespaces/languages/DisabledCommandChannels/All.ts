import { FT, T } from '#lib/types/index';

export const ChannelDoesNotExist = T<string>('serializerDisabledCommandChannelsChannelsDoesNotExist');
export const CommandDoesNotExist = FT<{ name: string }, string>('serializerDisabledCommandChannelsChannelsCommandDoesNotExist');
