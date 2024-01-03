import { FT, T } from '#lib/types';

export const Yes = T('globals:yes');
export const No = T('globals:no');
export const None = T('globals:none');
export const Unknown = T('globals:unknown');
export const PaginatedMessagePage = T('globals:paginatedMessagePage');
export const PaginatedMessageWrongUserInteractionReply = FT<{ user: string }>('globals:paginatedMessageWrongUserInteractionReply');
export const DurationValue = FT<{ value: number }>('globals:durationValue');
export const NumberValue = FT<{ value: number }>('globals:numberValue');
export const NumberCompactValue = FT<{ value: number }>('globals:numberCompactValue');
export const DateTimeValue = FT<{ value: number }>('globals:dateTimeValue');
export const HumanDateTimeValue = FT<{ value: number }>('globals:humanDateTimeValue');
export const AndListValue = FT<{ value: string[] }>('globals:andListValue');
export const OrListValue = FT<{ value: string[] }>('globals:orListValue');
export const DateFormat = T('globals:dateFormat');
export const DateFormatExplanation = T('globals:dateFormatExplanation');
