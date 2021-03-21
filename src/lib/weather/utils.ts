import { LanguageKeys } from '#lib/i18n/languageKeys';
import { assetsFolder } from '#utils/constants';
import { fetch } from '#utils/util';
import { UserError } from '@sapphire/framework';
import { Image } from 'canvas';
import { resolveImage } from 'canvas-constructor';
import type { TFunction } from 'i18next';
import { join } from 'path';
import { CurrentCondition, Weather, WeatherCode, WeatherName } from './types';

export function getColors(name: WeatherName): WeatherTheme {
	switch (name) {
		case 'LightShowers':
		case 'LightSleetShowers':
		case 'LightSnowShowers':
		case 'LightRain':
		case 'LightSleet':
		case 'LightSnow':
		case 'Cloudy':
		case 'Fog':
			return { background: '#2E2E2E', text: '#FAFAFA', theme: 'light' };
		case 'HeavyRain':
		case 'HeavyShowers':
		case 'VeryCloudy':
		case 'HeavySnow':
		case 'HeavySnowShowers':
			return { background: '#FAFAFA', text: '#1F1F1F', theme: 'dark' };
		case 'PartlyCloudy':
		case 'Sunny':
			return { background: '#8AD5FF', text: '#1F1F1F', theme: 'dark' };
		case 'ThunderyHeavyRain':
		case 'ThunderyShowers':
		case 'ThunderySnowShowers':
			return { background: '##99446B', text: '#FAFAFA', theme: 'light' };
		default:
			throw new Error(`Could not find weather name '${name}'.`);
	}
}

const getWeatherNameMap = new Map<WeatherCode, WeatherName>([
	[WeatherCode.ClearOrSunny, 'Sunny'],
	[WeatherCode.PartlyCloudy, 'PartlyCloudy'],
	[WeatherCode.Cloudy, 'Cloudy'],
	[WeatherCode.Overcast, 'VeryCloudy'],
	[WeatherCode.Mist, 'Fog'],
	[WeatherCode.PatchyRainNearby, 'LightShowers'],
	[WeatherCode.PatchySnowNearby, 'LightSleetShowers'],
	[WeatherCode.PatchySleetNearby, 'LightSleet'],
	[WeatherCode.PatchyFreezingDrizzleNearby, 'LightSleet'],
	[WeatherCode.ThunderyOutbreaksInNearby, 'ThunderyShowers'],
	[WeatherCode.BlowingSnow, 'LightSnow'],
	[WeatherCode.Blizzard, 'HeavySnow'],
	[WeatherCode.Fog, 'Fog'],
	[WeatherCode.FreezingFog, 'Fog'],
	[WeatherCode.PatchyLightDrizzle, 'LightShowers'],
	[WeatherCode.LightDrizzle, 'LightRain'],
	[WeatherCode.FreezingDrizzle, 'LightSleet'],
	[WeatherCode.HeavyFreezingDrizzle, 'LightSleet'],
	[WeatherCode.PatchyLightRain, 'LightRain'],
	[WeatherCode.LightRain, 'LightRain'],
	[WeatherCode.ModerateRainAtTimes, 'HeavyShowers'],
	[WeatherCode.ModerateRain, 'HeavyRain'],
	[WeatherCode.HeavyRainAtTimes, 'HeavyShowers'],
	[WeatherCode.HeavyRain, 'HeavyRain'],
	[WeatherCode.LightFreezingRain, 'LightSleet'],
	[WeatherCode.ModerateOrHeavyFreezingRain, 'LightSleet'],
	[WeatherCode.LightSleet, 'LightSleet'],
	[WeatherCode.ModerateOrHeavySleet, 'LightSnow'],
	[WeatherCode.PatchyLightSnow, 'LightSnowShowers'],
	[WeatherCode.LightSnow, 'LightSnowShowers'],
	[WeatherCode.PatchyModerateSnow, 'HeavySnow'],
	[WeatherCode.ModerateSnow, 'HeavySnow'],
	[WeatherCode.PatchyHeavySnow, 'HeavySnowShowers'],
	[WeatherCode.HeavySnow, 'HeavySnow'],
	[WeatherCode.IcePellets, 'LightSleet'],
	[WeatherCode.LightRainShower, 'LightShowers'],
	[WeatherCode.ModerateOrHeavyRainShower, 'HeavyShowers'],
	[WeatherCode.TorrentialRainShower, 'HeavyShowers'],
	[WeatherCode.LightSleetShowers, 'LightSleetShowers'],
	[WeatherCode.ModerateOrHeavySleetShowers, 'LightSleetShowers'],
	[WeatherCode.LightSnowShowers, 'LightSnowShowers'],
	[WeatherCode.ModerateOrHeavySnowShowers, 'LightSnowShowers'],
	[WeatherCode.LightShowersOfIcePellets, 'LightSleetShowers'],
	[WeatherCode.ModerateOrHeavyShowersOfIcePellets, 'LightSleet'],
	[WeatherCode.PatchyLightRainInAreaWithThunder, 'ThunderyShowers'],
	[WeatherCode.ModerateOrHeavyRainInAreaWithThunder, 'ThunderyHeavyRain'],
	[WeatherCode.PatchyLightSnowInAreaWithThunder, 'ThunderySnowShowers'],
	[WeatherCode.ModerateOrHeavySnowInAreaWithThunder, 'HeavySnowShowers']
]);
export function getWeatherName(code: WeatherCode): WeatherName {
	const name = getWeatherNameMap.get(code);
	if (name === undefined) throw new Error(`The code '${code}' is not available.`);
	return name;
}

const weatherFolder = join(assetsFolder, 'images', 'weather');
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
export async function getData(name: string, lang: string): Promise<Weather> {
	try {
		const url = new URL(`${getDataBaseURL}~${encodeURIComponent(name)}`);
		url.searchParams.append('format', 'j1');
		url.searchParams.append('lang', lang);
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
