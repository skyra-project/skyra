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
export const LmgtfyClick = FT<{ link: string }, string>('commands/google:lmgtfyClick');
export const LmgtfyDescription = T<string>('commands/google:lmgtfyDescription');
export const LmgtfyExtended = T<LanguageHelpDisplayOptions>('commands/google:lmgtfyExtended');
export const MessagesErrorInvalidRequest = T<string>('commands/google:errorInvalidRequest');
export const MessagesErrorOverQueryLimit = T<string>('commands/google:errorOverQueryLimit');
export const MessagesErrorPermissionDenied = T<string>('commands/google:errorPermissionDenied');
export const MessagesErrorRequestDenied = T<string>('commands/google:errorRequestDenied');
export const MessagesErrorUnknown = T<string>('commands/google:errorUnknown');
export const MessagesErrorZeroResults = T<string>('commands/google:errorZeroResults');
export const WeatherDescription = T<string>('commands/google:weatherDescription');
export const WeatherExtended = T<LanguageHelpDisplayOptions>('commands/google:weatherExtended');

export const WeatherTemperatureFahrenheit = FT<{ value: number; feelsLike: number }, string>('commands/google:weatherFahrenheit');
export const WeatherInches = FT<{ value: number }, string>('commands/google:weatherInches');
export const WeatherMiles = FT<{ value: number }, string>('commands/google:weatherMiles');
export const WeatherMilesPerHour = FT<{ value: number }, string>('commands/google:weatherMilesPerHour');
export const WeatherTemperatureCelsius = FT<{ value: number; feelsLike: number }, string>('commands/google:weatherCelsius');
export const WeatherMillimeters = FT<{ value: number }, string>('commands/google:weatherMillimeters');
export const WeatherPascal = FT<{ value: number }, string>('commands/google:weatherPascal');
export const WeatherKilometers = FT<{ value: number }, string>('commands/google:weatherKilometers');
export const WeatherKilometersPerHour = FT<{ value: number }, string>('commands/google:weatherKilometersPerHour');

export const WeatherInvalidJsonBody = FT<{ query: string }, string>('commands/google:weatherInvalidJsonBody');
export const WeatherUnknownLocation = FT<{ query: string }, string>('commands/google:weatherUnknownLocation');
export const WeatherUnknownError = FT<{ query: string }, string>('commands/google:weatherUnknownError');
export const WeatherBlockedLocation = FT<{ query: string }, string>('commands/google:weatherBlockedLocation');
export const WeatherRateLimited = FT<{ query: string }, string>('commands/google:weatherRateLimited');
export const WeatherRemoteServerError = FT<{ query: string }, string>('commands/google:weatherRemoteServerError');
export const WeatherServiceUnavailable = FT<{ query: string }, string>('commands/google:weatherServiceUnavailable');
