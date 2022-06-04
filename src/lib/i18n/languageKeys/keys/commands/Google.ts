import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const WeatherDescription = T<string>('commands/google:weatherDescription');
export const WeatherExtended = T<LanguageHelpDisplayOptions>('commands/google:weatherExtended');

export const WeatherTemperatureFahrenheit = FT<{ value: number; feelsLike: number }, string>('commands/google:weatherFahrenheit');
export const WeatherInches = FT<{ value: number }, string>('commands/google:weatherInches');
export const WeatherMiles = FT<{ value: number }, string>('commands/google:weatherMiles');
export const WeatherMilesPerHour = FT<{ value: number }, string>('commands/google:weatherMilesPerHour');
export const WeatherTemperatureCelsius = FT<{ value: number; feelsLike: number }, string>('commands/google:weatherCelsius');
export const WeatherTemperatureKelvin = FT<{ value: number }, string>('commands/google:weatherKelvin');
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
