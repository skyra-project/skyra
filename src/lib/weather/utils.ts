import { LanguageKeys } from '#lib/i18n/languageKeys';
import { assetsFolder } from '#utils/constants';
import { fetch } from '#utils/util';
import { UserError } from '@sapphire/framework';
import { Image } from 'canvas';
import { resolveImage } from 'canvas-constructor';
import type { TFunction } from 'i18next';
import { join } from 'path';
import type { CurrentCondition, Weather, WeatherName } from './types';

export function getColors(name: WeatherName): WeatherTheme {
	switch (name) {
		case 'Cloudy':
		case 'Fog':
			return { background: '#2E2E2E', text: '#FAFAFA', theme: 'dark' };
		case 'HeavyRain':
		case 'HeavyShowers':
		case 'VeryCloudy':
			return { background: '#EAEAEA', text: '#1F1F1F', theme: 'light' };
		case 'HeavySnow':
		case 'HeavySnowShowers':
			return { background: '#FAFAFA', text: '#1F1F1F', theme: 'light' };
		case 'LightRain':
		case 'LightSleet':
		case 'LightSnow':
			return { background: '#5AABC8', text: '#1F1F1F', theme: 'light' };
		case 'LightShowers':
		case 'LightSleetShowers':
		case 'LightSnowShowers':
		case 'PartlyCloudy':
		case 'Sunny':
			return { background: '#6ABBD8', text: '#1F1F1F', theme: 'light' };
		case 'ThunderyHeavyRain':
		case 'ThunderyShowers':
		case 'ThunderySnowShowers':
			return { background: '##99446B', text: '#FAFAFA', theme: 'dark' };
	}
}

const weatherFolder = join(assetsFolder, 'weather');
const getFileCache = new Map<WeatherName, Image>();
export async function getFile(name: WeatherName): Promise<Image> {
	const existing = getFileCache.get(name);
	if (existing !== undefined) return existing;

	const image = await resolveImage(join(weatherFolder, `${name}.png`));
	getFileCache.set(name, image);
	return image;
}

const getIconsCache = new Map<Theme, Icons>();
export async function getIcons(theme: Theme): Promise<Icons> {
	const existing = getIconsCache.get(theme);
	if (existing !== undefined) return existing;

	const [pointer, precipitation, temperature, visibility] = await Promise.all([
		resolveImage(join(weatherFolder, theme, 'pointer.png')),
		resolveImage(join(weatherFolder, theme, 'precipitation.png')),
		resolveImage(join(weatherFolder, theme, 'temperature.png')),
		resolveImage(join(weatherFolder, theme, 'visibility.png'))
	]);

	const icons: Icons = { pointer, precipitation, temperature, visibility };
	getIconsCache.set(theme, icons);
	return icons;
}

const getDataBaseURL = 'https://wttr.in/';
export async function getData(name: string): Promise<Weather> {
	try {
		const url = `${getDataBaseURL}${encodeURIComponent(name)}`;
		return await fetch(url);
	} catch (error) {
		throw new UserError({ identifier: LanguageKeys.Commands.Google.MessagesErrorUnknown, context: { error } });
	}
}

export function resolveCurrentConditionsImperial(conditions: CurrentCondition, t: TFunction): ResolvedConditions {
	return {
		precipitation: t(LanguageKeys.Commands.Google.WeatherInches, { value: Number(conditions.precipInches) }),
		pressure: t(LanguageKeys.Commands.Google.WeatherInches, { value: Number(conditions.pressureInches) }),
		temperature: t(LanguageKeys.Commands.Google.WeatherTemperatureFahrenheit, {
			value: Number(conditions.temp_F),
			feelsLike: Number(conditions.FeelsLikeF)
		}),
		visibility: t(LanguageKeys.Commands.Google.WeatherMiles, { value: Number(conditions.visibilityMiles) }),
		windSpeed: t(LanguageKeys.Commands.Google.WeatherMilesPerHour, { value: Number(conditions.windspeedMiles) })
	};
}

export function resolveCurrentConditionsSI(conditions: CurrentCondition, t: TFunction): ResolvedConditions {
	return {
		precipitation: t(LanguageKeys.Commands.Google.WeatherMillimeters, { value: Number(conditions.precipMM) }),
		pressure: t(LanguageKeys.Commands.Google.WeatherPascal, { value: Number(conditions.pressure) }),
		temperature: t(LanguageKeys.Commands.Google.WeatherTemperatureCelsius, {
			value: Number(conditions.temp_C),
			feelsLike: Number(conditions.FeelsLikeC)
		}),
		visibility: t(LanguageKeys.Commands.Google.WeatherKilometers, { value: Number(conditions.visibility) }),
		windSpeed: t(LanguageKeys.Commands.Google.WeatherKilometersPerHour, { value: Number(conditions.windspeedKmph) })
	};
}

export function resolveWeatherName(name: WeatherName): string {
	switch (name) {
		case 'Cloudy':
			return LanguageKeys.Commands.Google.WeatherTypeCloudy;
		case 'Fog':
			return LanguageKeys.Commands.Google.WeatherTypeFog;
		case 'HeavyRain':
			return LanguageKeys.Commands.Google.WeatherTypeHeavyRain;
		case 'HeavyShowers':
			return LanguageKeys.Commands.Google.WeatherTypeHeavyShowers;
		case 'HeavySnow':
			return LanguageKeys.Commands.Google.WeatherTypeHeavySnow;
		case 'HeavySnowShowers':
			return LanguageKeys.Commands.Google.WeatherTypeHeavySnowShowers;
		case 'LightRain':
			return LanguageKeys.Commands.Google.WeatherTypeLightRain;
		case 'LightShowers':
			return LanguageKeys.Commands.Google.WeatherTypeLightShowers;
		case 'LightSleet':
			return LanguageKeys.Commands.Google.WeatherTypeLightSleet;
		case 'LightSleetShowers':
			return LanguageKeys.Commands.Google.WeatherTypeLightSleetShowers;
		case 'LightSnow':
			return LanguageKeys.Commands.Google.WeatherTypeLightSnow;
		case 'LightSnowShowers':
			return LanguageKeys.Commands.Google.WeatherTypeLightSnowShowers;
		case 'PartlyCloudy':
			return LanguageKeys.Commands.Google.WeatherTypePartlyCloudy;
		case 'Sunny':
			return LanguageKeys.Commands.Google.WeatherTypeSunny;
		case 'ThunderyHeavyRain':
			return LanguageKeys.Commands.Google.WeatherTypeThunderyHeavyRain;
		case 'ThunderyShowers':
			return LanguageKeys.Commands.Google.WeatherTypeThunderyShowers;
		case 'ThunderySnowShowers':
			return LanguageKeys.Commands.Google.WeatherTypeThunderySnowShowers;
		case 'VeryCloudy':
			return LanguageKeys.Commands.Google.WeatherTypeVeryCloudy;
	}
}

export type Theme = 'light' | 'dark';

export interface WeatherTheme {
	background: `#${string}`;
	text: `#${string}`;
	theme: Theme;
}

export interface ResolvedConditions {
	precipitation: string;
	pressure: string;
	temperature: string;
	visibility: string;
	windSpeed: string;
}

export interface Icons {
	pointer: Image;
	precipitation: Image;
	temperature: Image;
	visibility: Image;
}
