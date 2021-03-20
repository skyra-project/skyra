export type IntegerString = `${bigint}`;
export type FloatString = `${number}`;

export interface Weather {
	current_condition: CurrentCondition[];
	nearest_area: NearestArea[];
	request: Request[];
	weather: WeatherElement[];
}

export interface CurrentCondition {
	FeelsLikeC: IntegerString;
	FeelsLikeF: IntegerString;
	cloudcover: IntegerString;
	humidity: IntegerString;
	localObsDateTime: Date;
	observation_time: Hour;
	precipInches: FloatString;
	precipMM: FloatString;
	pressure: IntegerString;
	pressureInches: IntegerString;
	temp_C: IntegerString;
	temp_F: IntegerString;
	uvIndex: IntegerString;
	visibility: IntegerString;
	visibilityMiles: IntegerString;
	weatherCode: WeatherCode;
	weatherDesc: WeatherDescription[];
	weatherIconUrl: Url[];
	winddir16Point: WindDirection;
	winddirDegree: IntegerString;
	windspeedKmph: IntegerString;
	windspeedMiles: IntegerString;
}

export const enum WeatherCode {
	Blizzard = 230,
	BlowingSnow = 227,
	ClearOrSunny = 113,
	Cloudy = 119,
	Fog = 248,
	FreezingDrizzle = 281,
	FreezingFog = 260,
	HeavyFreezingDrizzle = 284,
	HeavyRain = 308,
	HeavyRainAtTimes = 305,
	HeavySnow = 338,
	IcePellets = 350,
	LightDrizzle = 266,
	LightFreezingRRain = 311,
	LightRain = 296,
	LightRainShower = 353,
	LightShowersOfIcePellets = 374,
	LightSleet = 317,
	LightSleetShowers = 362,
	LightSnow = 326,
	LightSnowShowers = 368,
	Mist = 143,
	ModerateOrHeavyFreezingRain = 314,
	ModerateOrHeavyRainInAreaWithThunder = 389,
	ModerateOrHeavyRainShower = 356,
	ModerateOrHeavyShowersOfIcePellets = 377,
	ModerateOrHeavySleet = 320,
	ModerateOrHeavySleetShowers = 365,
	ModerateOrHeavySnowInAreaWithThunder = 395,
	ModerateOrHeavySnowShowers = 371,
	ModerateRain = 302,
	ModerateRainAtTimes = 299,
	ModerateSnow = 332,
	Overcast = 122,
	PartlyCloudy = 116,
	PatchyFreezingDrizzleNearby = 185,
	PatchyHeavySnow = 335,
	PatchyLightDrizzle = 263,
	PatchyLightRain = 293,
	PatchyLightRainInAreaWithThunder = 386,
	PatchyLightSnow = 323,
	PatchyLightSnowInAreaWithThunder = 392,
	PatchyModerateSnow = 329,
	PatchyRainNearby = 176,
	PatchySleetNearby = 182,
	PatchySnowNearby = 179,
	ThunderyOutbreaksInNearby = 200,
	TorrentialRainShower = 359
}

export interface WeatherDescription {
	value: WeatherName;
}

export type WeatherName =
	| 'Cloudy'
	| 'Fog'
	| 'HeavyRain'
	| 'HeavyShowers'
	| 'HeavySnow'
	| 'HeavySnowShowers'
	| 'LightRain'
	| 'LightShowers'
	| 'LightSleet'
	| 'LightSleetShowers'
	| 'LightSnow'
	| 'LightSnowShowers'
	| 'PartlyCloudy'
	| 'Sunny'
	| 'ThunderyHeavyRain'
	| 'ThunderyShowers'
	| 'ThunderySnowShowers'
	| 'VeryCloudy';

export interface NearestArea {
	areaName: AreaName[];
	country: Country[];
	latitude: FloatString;
	longitude: FloatString;
	population: IntegerString;
	region: Region[];
	weatherUrl: Url[];
}

export interface AreaName {
	value: string;
}

export interface Country {
	value: string;
}

export interface Region {
	value: string;
}

export interface Url {
	value: string;
}

export interface Request {
	query: string;
	type: 'LatLon';
}

export interface WeatherElement {
	astronomy: Astronomy[];
	avgtempC: IntegerString;
	avgtempF: IntegerString;
	date: Date;
	hourly: Hourly[];
	maxtempC: IntegerString;
	maxtempF: IntegerString;
	mintempC: IntegerString;
	mintempF: IntegerString;
	sunHour: FloatString;
	totalSnow_cm: FloatString;
	uvIndex: IntegerString;
}

export interface Astronomy {
	moon_illumination: IntegerString;
	moon_phase: MoonPhase;
	moonrise: Hour;
	moonset: Hour;
	sunrise: Hour;
	sunset: Hour;
}

export type MoonPhase =
	| 'New Moon'
	| 'Waxing Crescent'
	| 'First Quarter'
	| 'Waxing Gibbous'
	| 'Full Moon'
	| 'Waning Gibbous'
	| 'Last Quarter'
	| 'Waning Crescent';

export type Hour = `${bigint}:${bigint} ${'AM' | 'PM'}`;

export interface Hourly {
	DewPointC: IntegerString;
	DewPointF: IntegerString;
	FeelsLikeC: IntegerString;
	FeelsLikeF: IntegerString;
	HeatIndexC: IntegerString;
	HeatIndexF: IntegerString;
	WindChillC: IntegerString;
	WindChillF: IntegerString;
	WindGustKmph: IntegerString;
	WindGustMiles: IntegerString;
	chanceoffog: IntegerString;
	chanceoffrost: IntegerString;
	chanceofhightemp: IntegerString;
	chanceofovercast: IntegerString;
	chanceofrain: IntegerString;
	chanceofremdry: IntegerString;
	chanceofsnow: IntegerString;
	chanceofsunshine: IntegerString;
	chanceofthunder: IntegerString;
	chanceofwindy: IntegerString;
	cloudcover: IntegerString;
	humidity: IntegerString;
	precipInches: FloatString;
	precipMM: FloatString;
	pressure: IntegerString;
	pressureInches: FloatString;
	tempC: IntegerString;
	tempF: IntegerString;
	time: IntegerString;
	uvIndex: IntegerString;
	visibility: IntegerString;
	visibilityMiles: IntegerString;
	weatherCode: WeatherCode;
	weatherDesc: WeatherDescription[];
	weatherIconUrl: Url[];
	winddir16Point: WindDirection;
	winddirDegree: IntegerString;
	windspeedKmph: IntegerString;
	windspeedMiles: IntegerString;
}

export type WindDirectionNorth = 'N' | 'NNE';
export type WindDirectionNorthEast = 'NE' | 'ENE';
export type WindDirectionEast = 'E' | 'ESE';
export type WindDirectionSouthEast = 'SE' | 'SSE';
export type WindDirectionSouth = 'S' | 'SSW';
export type WindDirectionSouthWest = 'SW' | 'WSW';
export type WindDirectionWest = 'W' | 'WNW';
export type WindDirectionNorthWest = 'NW' | 'NNW';
export type WindDirection =
	| WindDirectionNorth
	| WindDirectionNorthEast
	| WindDirectionEast
	| WindDirectionSouthEast
	| WindDirectionSouth
	| WindDirectionSouthWest
	| WindDirectionWest
	| WindDirectionNorthWest;
