import { T } from '@lib/types/Shared';

export const RangeInvalid = T<(params: { name: string }) => string>('argumentRangeInvalid');
export const RangeMax = T<(params: { name: string; maximum: number; count: number }) => string>('argumentRangeMax');
export const RangeMaxPlural = T<(params: { name: string; maximum: number; count: number }) => string>('argumentRangeMaxPlural');
