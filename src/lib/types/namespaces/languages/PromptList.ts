import { FT, T } from '#lib/types';

export const MultipleChoice = FT<{ list: string; count: number }, string>('promptlistMultipleChoice');
export const MultipleChoicePlural = FT<{ list: string; count: number }, string>('promptlistMultipleChoicePlural');
export const AttemptFailed = FT<{ list: string; attempt: number; maxAttempts: number }, string>('promptlistAttemptFailed');
export const Aborted = T<string>('promptlistAborted');
