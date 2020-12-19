import { FT } from '#lib/types';

export const RangeInvalid = FT<{ name: string }, string>('argument:rangeInvalid');
export const RangeMax = FT<{ name: string; maximum: number; count: number }, string>('argument:rangeMax');
