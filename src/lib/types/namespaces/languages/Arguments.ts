import { FT } from '#lib/types';

export const RangeInvalid = FT<{ name: string }, string>('argumentRangeInvalid');
export const RangeMax = FT<{ name: string; maximum: number; count: number }, string>('argumentRangeMax');
export const RangeMaxPlural = FT<{ name: string; maximum: number; count: number }, string>('argumentRangeMaxPlural');
