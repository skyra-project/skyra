import { FT, T } from '#lib/types';

export const ChannelDoesNotExist = T<string>('serializers:disabledCommandChannelsChannelsDoesNotExist');
export const CommandDoesNotExist = FT<{ name: string }, string>('serializers:disabledCommandChannelsChannelsCommandDoesNotExist');
