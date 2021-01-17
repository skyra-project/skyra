import { FT, T } from '#lib/types';

export const Yes = T<string>('globals:yes');
export const No = T<string>('globals:no');
export const None = T<string>('globals:none');
export const Is = T<string>('globals:is');
export const And = T<string>('globals:and');
export const Or = T<string>('globals:or');
export const Unknown = T<string>('globals:unknown');
export const OrdinalValue = FT<{ value: string }, string>('globals:ordinalValue');
export const DurationValue = FT<{ value: number }, string>('globals:durationValue');
export const NumberValue = FT<{ value: number }, string>('globals:numberValue');
export const NumberCompactValue = FT<{ value: number }, string>('globals:numberCompactValue');
export const DateValue = FT<{ value: number }, string>('globals:dateValue');
export const DateTimeValue = FT<{ value: number }, string>('globals:dateTimeValue');
export const AndListValue = FT<{ value: string[] }, string>('globals:andListValue');
export const OrListValue = FT<{ value: string[] }, string>('globals:orListValue');
