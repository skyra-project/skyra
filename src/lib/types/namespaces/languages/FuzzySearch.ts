import { FT, T } from '#lib/types';

export const Matches = FT<{ matches: number; codeblock: string }, string>('fuzzySearch:matches');
export const Aborted = T<string>('fuzzySearch:aborted');
export const InvalidNumber = T<string>('fuzzySearch:invalidNumber');
export const InvalidIndex = T<string>('fuzzySearch:invalidIndex');
