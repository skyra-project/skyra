import { LanguageKeys } from '#lib/i18n/languageKeys';
import { safeWrapPromise } from '#utils/common';
import { assetsFolder } from '#utils/constants';
import { fetch, FetchResultTypes, QueryError } from '@sapphire/fetch';
import { Store, UserError } from '@sapphire/framework';
import { tryParse } from '@sapphire/utilities';
import type { Image } from 'canvas';
import { resolveImage } from 'canvas-constructor';
import { cyan, gray, red } from 'colorette';
import type { TFunction } from 'i18next';
import { join } from 'path';
import { URL } from 'url';
import { CurrentCondition, Weather, WeatherCode, WeatherName } from './types';

export function getColors(name: WeatherName): WeatherTheme {
	switch (name) {
		case 'LightShowers':
		case 'LightSleetShowers':
		case 'LightSnowShowers':
		case 'LightRain':
		case 'LightSleet':
		case 'LightSnow':
		case 'HeavySnow':
		case 'HeavySnowShowers':
		case 'Cloudy':
		case 'Fog':
			return { background: '#2E2E2E', text: '#FAFAFA', theme: 'light' };
		case 'HeavyRain':
		case 'HeavyShowers':
		case 'VeryCloudy':
			return { background: '#EAEAEA', text: '#1F1F1F', theme: 'dark' };
		case 'PartlyCloudy':
		case 'Sunny':
			return { background: '#0096D6', text: '#FAFAFA', theme: 'light' };
		case 'ThunderyHeavyRain':
		case 'ThunderyShowers':
		case 'ThunderySnowShowers':
			return { background: '#99446B', text: '#FAFAFA', theme: 'light' };
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
	[WeatherCode.ModerateOrHeavySnowInAreaWithThunder, 'ThunderySnowShowers']
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
export async function getData(query: string, lang: string): Promise<Weather> {
	const url = new URL(`${getDataBaseURL}~${encodeURIComponent(query)}`);
	url.searchParams.append('format', 'j1');
	url.searchParams.append('lang', lang);

	const result = await safeWrapPromise<string, QueryError>(fetch(url, FetchResultTypes.Text));
	if (result.success) {
		const { value } = result;
		// JSON object:
		if (value.startsWith('{')) {
			const parsed = tryParse(value);
			if (parsed === null) throw new UserError({ identifier: LanguageKeys.Commands.Google.WeatherInvalidJsonBody, context: { query } });
			return parsed as Weather;
		}

		// Yes, wttr.in returns 200 OK on errors (ref: https://github.com/chubin/wttr.in/issues/591).
		// "Unknown location; ..." message:
		if (value.startsWith('Unknown location')) {
			throw new UserError({ identifier: LanguageKeys.Commands.Google.WeatherUnknownLocation, context: { query } });
		}

		// Log the error and return unknown error:
		Store.injectedContext.logger.error(`[${cyan('WEATHER')}]: Unknown Error Body Received: ${gray(value)}`);
		throw new UserError({ identifier: LanguageKeys.Commands.Google.WeatherUnknownError, context: { query } });
	}

	const { error } = result;
	if (error.code === 403) throw new UserError({ identifier: LanguageKeys.Commands.Google.WeatherBlockedLocation, context: { query } });
	if (error.code === 429) throw new UserError({ identifier: LanguageKeys.Commands.Google.WeatherRateLimited, context: { query } });
	if (error.code === 500) throw new UserError({ identifier: LanguageKeys.Commands.Google.WeatherRemoteServerError, context: { query } });
	if (error.code === 503) throw new UserError({ identifier: LanguageKeys.Commands.Google.WeatherServiceUnavailable, context: { query } });

	// Log the error and return unknown error:
	Store.injectedContext.logger.error(`[${cyan('WEATHER')}]: Unknown Error Code Received: ${red(error.code.toString())} - ${gray(error.body)}`);
	throw new UserError({ identifier: LanguageKeys.Commands.Google.WeatherUnknownError, context: { query } });
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

export function resolveCurrentConditionsSI(conditions: CurrentCondition, t: TFunction, options: ConditionsOptions = {}): ResolvedConditions {
	const kelvin = options.kelvin ?? false;
	const temperature = Number(conditions.temp_C);
	return {
		precipitation: t(LanguageKeys.Commands.Google.WeatherMillimeters, { value: Number(conditions.precipMM) }),
		pressure: t(LanguageKeys.Commands.Google.WeatherPascal, { value: Number(conditions.pressure) }),
		temperature: kelvin
			? t(LanguageKeys.Commands.Google.WeatherTemperatureKelvin, { value: celsiusToKelvin(temperature) })
			: t(LanguageKeys.Commands.Google.WeatherTemperatureCelsius, { value: temperature, feelsLike: Number(conditions.FeelsLikeC) }),
		visibility: t(LanguageKeys.Commands.Google.WeatherKilometers, { value: Number(conditions.visibility) }),
		windSpeed: t(LanguageKeys.Commands.Google.WeatherKilometersPerHour, { value: Number(conditions.windspeedKmph) })
	};
}

export interface ConditionsOptions {
	kelvin?: boolean;
}

function celsiusToKelvin(celsius: number): number {
	return celsius + 273.15;
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
