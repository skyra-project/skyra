import { FT } from '#lib/types';
import type { ThreadChannel } from 'discord.js';

export const ExpectedNonThreadChannel = FT<{ channel: ThreadChannel }>('assertions:expectedNonThreadChannel');
