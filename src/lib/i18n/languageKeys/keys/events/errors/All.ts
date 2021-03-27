import { FT, T } from '#lib/types';

export const UnexpectedError = T<string>('events/errors:unexpectedError');
export const UnexpectedErrorWithContext = FT<{ report: string }, string>('events/errors:unexpectedErrorWithContext');
export const String = FT<{ mention: string; message: string }, string>('events/errors:string');
