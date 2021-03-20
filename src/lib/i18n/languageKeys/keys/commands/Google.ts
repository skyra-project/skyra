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

export const WeatherTypeCloudy = T<string>('commands/google:weatherTypeCloudy');
export const WeatherTypeFog = T<string>('commands/google:weatherTypeFog');
export const WeatherTypeHeavyRain = T<string>('commands/google:weatherTypeHeavyRain');
export const WeatherTypeHeavyShowers = T<string>('commands/google:weatherTypeHeavyShowers');
export const WeatherTypeHeavySnow = T<string>('commands/google:weatherTypeHeavySnow');
export const WeatherTypeHeavySnowShowers = T<string>('commands/google:weatherTypeHeavySnowShowers');
export const WeatherTypeLightRain = T<string>('commands/google:weatherTypeLightRain');
export const WeatherTypeLightShowers = T<string>('commands/google:weatherTypeLightShowers');
export const WeatherTypeLightSleet = T<string>('commands/google:weatherTypeLightSleet');
export const WeatherTypeLightSleetShowers = T<string>('commands/google:weatherTypeLightSleetShowers');
export const WeatherTypeLightSnow = T<string>('commands/google:weatherTypeLightSnow');
export const WeatherTypeLightSnowShowers = T<string>('commands/google:weatherTypeLightSnowShowers');
export const WeatherTypePartlyCloudy = T<string>('commands/google:weatherTypePartlyCloudy');
export const WeatherTypeSunny = T<string>('commands/google:weatherTypeSunny');
export const WeatherTypeThunderyHeavyRain = T<string>('commands/google:weatherTypeThunderyHeavyRain');
export const WeatherTypeThunderyShowers = T<string>('commands/google:weatherTypeThunderyShowers');
export const WeatherTypeThunderySnowShowers = T<string>('commands/google:weatherTypeThunderySnowShowers');
export const WeatherTypeVeryCloudy = T<string>('commands/google:weatherTypeVeryCloudy');
