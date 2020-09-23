import { T } from '@lib/types/Shared';

export const Matches = T<(params: { matches: number; codeblock: string }) => string>('fuzzySearchMatches');
export const Aborted = T<string>('fuzzySearchAborted');
export const InvalidNumber = T<string>('fuzzySearchInvalidNumber');
export const InvalidIndex = T<string>('fuzzySearchInvalidIndex');
export const Page = T<(params: { page: number; pageCount: number; results: string }) => string>('listifyPage');
