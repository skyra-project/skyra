import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { TOKENS } from '#root/config';
import { assetsFolder } from '#utils/constants';
import { queryGoogleMapsAPI } from '#utils/Google';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { loadImage } from 'canvas';
import { Canvas } from 'canvas-constructor';
import { KlasaMessage } from 'klasa';
import { join } from 'path';

const COLORS = {
	cloudy: '#88929F',
	day: '#6ABBD8',
	night: '#575D83',
	rain: '#457AD0',
	snow: '#FAFAFA',
	thunderstorm: '#99446B',
	windy: '#33B679'
};

const celsiusToFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

const enum TemperatureUnit {
	Celsius,
	Fahrenheit
}

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 120,
	description: (language) => language.get(LanguageKeys.Commands.Google.WeatherDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Google.WeatherExtended),
	requiredPermissions: ['ATTACH_FILES'],
	usage: '<city:string>',
	flagSupport: true
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [query]: [string]) {
		const { formattedAddress, lat, lng, addressComponents } = await queryGoogleMapsAPI(message, query);

		const params = `${lat},${lng}`;
		let locality = '';
		let governing = '';
		let country = '';
		let continent = '';

		const useImperial = Reflect.has(message.flagArgs, 'fahrenheit') || Reflect.has(message.flagArgs, 'imperial');

		for (const component of addressComponents) {
			if (!locality.length && component.types.includes('locality')) locality = component.long_name;
			if (!governing.length && component.types.includes('administrative_area_level_1')) governing = component.long_name;
			if (!country.length && component.types.includes('country')) country = component.long_name;
			if (!continent.length && component.types.includes('continent')) continent = component.long_name;
		}

		const localityOrCountry = locality ? country : null;
		const state = locality && governing ? governing : localityOrCountry ?? null;

		const { currently } = await fetch<WeatherResultOk>(
			`https://api.darksky.net/forecast/${TOKENS.DARKSKY_WEATHER_KEY}/${params}?exclude=minutely,hourly,flags&units=si`,
			FetchResultTypes.JSON
		);

		const { icon } = currently;
		const condition = currently.summary;
		const chanceOfRain = Math.round((currently.precipProbability * 100) / 5) * 5;
		const temperature = Math.round(useImperial ? celsiusToFahrenheit(currently.temperature) : currently.temperature);
		const humidity = Math.round(currently.humidity * 100);

		return this.draw(message, {
			geoCodeLocation: formattedAddress,
			state,
			condition,
			icon,
			chanceOfRain,
			temperature,
			humidity,
			temperatureUnit: useImperial ? TemperatureUnit.Fahrenheit : TemperatureUnit.Celsius
		});
	}

	public async draw(
		message: KlasaMessage,
		{ geoCodeLocation, state, condition, icon, chanceOfRain, temperature, humidity, temperatureUnit }: WeatherData
	) {
		const [theme, fontColor] = ['snow', 'sleet', 'fog'].includes(icon) ? ['dark', '#444444'] : ['light', '#FFFFFF'];
		const [conditionBuffer, humidityBuffer, precipicityBuffer] = await Promise.all([
			loadImage(join(assetsFolder, 'images', 'weather', theme, `${icon}.png`)),
			loadImage(join(assetsFolder, 'images', 'weather', theme, 'humidity.png')),
			loadImage(join(assetsFolder, 'images', 'weather', theme, 'precip.png'))
		]);

		const attachment = await new Canvas(400, 230)
			.save()
			.setShadowColor('rgba(0,0,0,.7)')
			.setShadowBlur(7)
			.setColor(COLORS[this.timePicker(icon)])
			.createRoundedPath(10, 10, 380, 220, 5)
			.fill()
			.restore()

			// City Name
			.setTextFont('20px Roboto')
			.setColor(fontColor)
			.printWrappedText(geoCodeLocation, 30, 60, 300)

			// Prefecture Name
			.setTextFont('16px Roboto')
			.setColor(theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')
			.printText(state ?? '', 30, 30)

			// Temperature
			.setTextFont("48px 'Roboto Mono'")
			.setColor(fontColor)
			.printText(`${temperature}°${temperatureUnit === TemperatureUnit.Celsius ? 'C' : 'F'}`, 30, 190)

			// Condition
			.setTextFont('16px Roboto')
			.setTextAlign('right')
			.printText(condition, 370, 192)

			// Titles
			.setTextFont("16px 'Roboto Condensed'")
			.printText(`${humidity}%`, 353, 150)
			.printText(`${chanceOfRain}%`, 353, 171)

			// Icons
			.printImage(conditionBuffer, 325, 31, 48, 48)
			.printImage(humidityBuffer, 358, 138, 13, 13)
			.printImage(precipicityBuffer, 358, 158, 13, 13)

			.toBufferAsync();

		return message.channel.send(attachment, { files: [{ attachment, name: `${geoCodeLocation}.png` }] });
	}

	public timePicker(icon: string) {
		switch (icon) {
			case 'clear-day':
			case 'partly-cloudy-day':
				return 'day';

			case 'clear-night':
			case 'partly-cloudy-night':
				return 'night';

			case 'rain':
				return 'rain';

			case 'thunderstorm':
				return 'thunderstorm';

			case 'snow':
			case 'sleet':
			case 'fog':
				return 'snow';

			case 'wind':
			case 'tornado':
				return 'windy';

			default:
				return 'cloudy';
		}
	}
}

interface WeatherData {
	geoCodeLocation: string;
	state: string | null;
	condition: string;
	icon: string;
	chanceOfRain: number;
	temperature: number;
	humidity: number;
	temperatureUnit: TemperatureUnit;
}

export interface WeatherResultOk {
	latitude: number;
	longitude: number;
	timezone: string;
	currently: WeatherResultOkCurrently;
	daily: WeatherResultOkDaily;
	offset: number;
}

export interface WeatherResultOkCurrently {
	time: number;
	summary: string;
	icon: string;
	precipIntensity: number;
	precipProbability: number;
	temperature: number;
	apparentTemperature: number;
	dewPoint: number;
	humidity: number;
	pressure: number;
	windSpeed: number;
	windGust: number;
	windBearing: number;
	cloudCover: number;
	uvIndex: number;
	visibility: number;
	ozone: number;
}

export interface WeatherResultOkDaily {
	summary: string;
	icon: string;
	data: WeatherResultOkDatum[];
}

export interface WeatherResultOkDatum {
	time: number;
	summary: string;
	icon: string;
	sunriseTime: number;
	sunsetTime: number;
	moonPhase: number;
	precipIntensity: number;
	precipIntensityMax: number;
	precipIntensityMaxTime: number;
	precipProbability: number;
	precipType?: string;
	temperatureHigh: number;
	temperatureHighTime: number;
	temperatureLow: number;
	temperatureLowTime: number;
	apparentTemperatureHigh: number;
	apparentTemperatureHighTime: number;
	apparentTemperatureLow: number;
	apparentTemperatureLowTime: number;
	dewPoint: number;
	humidity: number;
	pressure: number;
	windSpeed: number;
	windGust: number;
	windGustTime: number;
	windBearing: number;
	cloudCover: number;
	uvIndex: number;
	uvIndexTime: number;
	visibility: number;
	ozone: number;
	temperatureMin: number;
	temperatureMinTime: number;
	temperatureMax: number;
	temperatureMaxTime: number;
	apparentTemperatureMin: number;
	apparentTemperatureMinTime: number;
	apparentTemperatureMax: number;
	apparentTemperatureMaxTime: number;
}
