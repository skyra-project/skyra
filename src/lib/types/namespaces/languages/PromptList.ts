import { T } from '@lib/types/Shared';

export const MultipleChoice = T<(params: { list: string; count: number }) => string>('promptlistMultipleChoice');
export const MultipleChoicePlural = T<(params: { list: string; count: number }) => string>('promptlistMultipleChoicePlural');
export const AttemptFailed = T<(params: { list: string; attempt: number; maxAttempts: number }) => string>('promptlistAttemptFailed');
export const Aborted = T<string>('promptlistAborted');
