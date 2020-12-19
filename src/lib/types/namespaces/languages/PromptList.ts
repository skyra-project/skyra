import { FT, T } from '#lib/types';

export const MultipleChoice = FT<{ list: string; count: number }, string>('promptlist:multipleChoice');
export const MultipleChoicePlural = FT<{ list: string; count: number }, string>('promptlist:multipleChoicePlural');
export const AttemptFailed = FT<{ list: string; attempt: number; maxAttempts: number }, string>('promptlist:attemptFailed');
export const Aborted = T<string>('promptlist:aborted');
