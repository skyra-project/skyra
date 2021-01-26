import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const CurrentTimeDescription = T<string>('commands/google:currentTimeDescription');
export const CurrentTimeDst = T<string>('commands/google:currentTimeDst');
export const CurrentTimeExtended = T<LanguageHelpDisplayOptions>('commands/google:currentTimeExtended');
export const CurrentTimeLocationNotFound = T<string>('commands/google:currentTimeLocationNotFound');
export const CurrentTimeNoDst = T<string>('commands/google:currentTimeNoDst');
export const CurrentTimeTitles = FT<{ dst: string }, { currentTime: string; currentDate: string; country: string; gmsOffset: string; dst: string }>(
	'commands/google:currentTimeTitles'
);
export const GimageDescription = T<string>('commands/google:gimageDescription');
export const GimageExtended = T<LanguageHelpDisplayOptions>('commands/google:gimageExtended');
export const GsearchDescription = T<string>('commands/google:gsearchDescription');
export const GsearchExtended = T<LanguageHelpDisplayOptions>('commands/google:gsearchExtended');
export const MessagesErrorInvalidRequest = T<string>('commands/google:errorInvalidRequest');
export const MessagesErrorOverQueryLimit = T<string>('commands/google:errorOverQueryLimit');
export const MessagesErrorPermissionDenied = T<string>('commands/google:errorPermissionDenied');
export const MessagesErrorRequestDenied = T<string>('commands/google:errorRequestDenied');
export const MessagesErrorUnknown = T<string>('commands/google:errorUnknown');
export const MessagesErrorZeroResults = T<string>('commands/google:errorZeroResults');
export const WeatherDescription = T<string>('commands/google:weatherDescription');
export const WeatherExtended = T<LanguageHelpDisplayOptions>('commands/google:weatherExtended');
