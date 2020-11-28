import { FT, T } from '#lib/types/index';

export const Matches = FT<{ matches: number; codeblock: string }, string>('fuzzySearchMatches');
export const Aborted = T<string>('fuzzySearchAborted');
export const InvalidNumber = T<string>('fuzzySearchInvalidNumber');
export const InvalidIndex = T<string>('fuzzySearchInvalidIndex');
export const Page = FT<{ page: number; pageCount: number; results: string }, string>('listifyPage');
