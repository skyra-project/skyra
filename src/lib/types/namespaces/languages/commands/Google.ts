import { FT, T } from '#lib/types/index';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const CurrentTimeDescription = T<string>('commandCurrentTimeDescription');
export const CurrentTimeExtended = T<LanguageHelpDisplayOptions>('commandCurrentTimeExtended');
export const CurrentTimeLocationNotFound = T<string>('commandCurrentTimeLocationNotFound');
export const CurrentTimeTitles = FT<
	{ dst: string },
	{
		currentTime: string;
		currentDate: string;
		country: string;
		gmsOffset: string;
		dst: string;
	}
>('commandCurrentTimeTitles');
export const CurrentTimeDst = T<string>('commandCurrentTimeDst');
export const CurrentTimeNoDst = T<string>('commandCurrentTimeNoDst');
export const GsearchDescription = T<string>('commandGsearchDescription');
export const GsearchExtended = T<LanguageHelpDisplayOptions>('commandGsearchExtended');
export const GimageDescription = T<string>('commandGimageDescription');
export const GimageExtended = T<LanguageHelpDisplayOptions>('commandGimageExtended');
export const LmgtfyDescription = T<string>('commandLmgtfyDescription');
export const LmgtfyExtended = T<LanguageHelpDisplayOptions>('commandLmgtfyExtended');
export const LmgtfyClick = T<string>('commandLmgtfyClick');
export const WeatherDescription = T<string>('commandWeatherDescription');
export const WeatherExtended = T<LanguageHelpDisplayOptions>('commandWeatherExtended');
export const MessagesErrorZeroResults = T<string>('googleErrorZeroResults');
export const MessagesErrorRequestDenied = T<string>('googleErrorRequestDenied');
export const MessagesErrorInvalidRequest = T<string>('googleErrorInvalidRequest');
export const MessagesErrorOverQueryLimit = T<string>('googleErrorOverQueryLimit');
export const MessagesErrorUnknown = T<string>('googleErrorUnknown');
