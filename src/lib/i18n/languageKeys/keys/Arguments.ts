import { FT } from '#lib/types';

export const RangeInvalid = FT<{ value: string }, string>('arguments/range:invalid');
export const RangeMax = FT<{ value: string; maximum: number; count: number }, string>('arguments/range:max');
