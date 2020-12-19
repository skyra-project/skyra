import { FT } from '#lib/types';

export const RangeInvalid = FT<{ name: string }, string>('arguments/range:invalid');
export const RangeMax = FT<{ name: string; maximum: number; count: number }, string>('arguments/range:max');
