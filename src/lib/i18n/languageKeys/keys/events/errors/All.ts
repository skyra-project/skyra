import { FT, T } from '#lib/types';

export const Wtf = T<string>('events/errors:wtf');
export const String = FT<{ mention: string; message: string }, string>('events/errors:string');
