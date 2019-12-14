import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage } from 'klasa';
import { join } from 'path';
import { TOKENS } from '../../../config';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { assetsFolder } from '../../lib/util/constants';
import { queryGoogleMapsAPI } from '../../lib/util/Google';
import { fetch, FetchResultTypes } from '../../lib/util/util';

const COLORS = {
	cloudy: '#88929F',
	day: '#6ABBD8',
	night: '#575D83',
	rain: '#457AD0',
	snow: '#FAFAFA',
	thunderstorm: '#99446B',
	windy: '#33B679'
};

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 120,
			description: language => language.tget('COMMAND_WEATHER_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WEATHER_EXTENDED'),
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<city:string>'
		});
	}

	public async run(message: KlasaMessage, [query]: [string]) {
		const { formattedAddress, lat, lng, addressComponents } = await queryGoogleMapsAPI(message, this.client, query);

		const params = `${lat},${lng}`;
		let locality = '';
		let governing = '';
		let country = '';
		let continent = '';

		for (const component of addressComponents) {
			if (!locality.length && component.types.includes('locality')) locality = component.long_name;
			if (!governing.length && component.types.includes('administrative_area_level_1')) governing = component.long_name;
			if (!country.length && component.types.includes('country')) country = component.long_name;
			if (!continent.length && component.types.includes('continent')) continent = component.long_name;
		}

		const localityOrCountry = locality! ? country! : '';
		const state = locality! && governing! ? governing! : localityOrCountry || '';

		const { currently } = await fetch(`https://api.darksky.net/forecast/${TOKENS.DARKSKY_WEATHER_KEY}/${params}?exclude=minutely,hourly,flags&units=si`, FetchResultTypes.JSON) as WeatherResultOk;

		const { icon } = currently;
		const condition = currently.summary;
		const chanceOfRain = Math.round((currently.precipProbability * 100) / 5) * 5;
		const temperature = Math.round(currently.temperature);
		const humidity = Math.round(currently.humidity * 100);

		return this.draw(message, { geoCodeLocation: formattedAddress, state, condition, icon, chanceOfRain, temperature, humidity });
	}

	public async draw(message: KlasaMessage, { geoCodeLocation, state, condition, icon, chanceOfRain, temperature, humidity }: WeatherData) {
		const [theme, fontColor] = ['snow', 'sleet', 'fog'].includes(icon) ? ['dark', '#444444'] : ['light', '#FFFFFF'];
		const [conditionBuffer, humidityBuffer, precipicityBuffer] = await Promise.all([
			readFile(join(assetsFolder, 'images', 'weather', theme, `${icon}.png`)),
			readFile(join(assetsFolder, 'images', 'weather', theme, 'humidity.png')),
			readFile(join(assetsFolder, 'images', 'weather', theme, 'precip.png'))
		]);

		const attachment = await new Canvas(400, 180)
			.save()
			.setShadowColor('rgba(0,0,0,.7)')
			.setShadowBlur(7)
			.setColor(COLORS[this.timePicker(icon)])
			.createBeveledPath(10, 10, 380, 160, 5)
			.fill()
			.restore()

			// City Name
			.setTextFont('20px Roboto')
			.setColor(fontColor)
			.addText(geoCodeLocation, 35, 50)

			// Prefecture Name
			.setTextFont('16px Roboto')
			.setColor(theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')
			.addText(state || '', 35, 72.5)

			// Temperature
			.setTextFont("48px 'Roboto Mono'")
			.setColor(fontColor)
			.addText(`${temperature}°C`, 35, 140)

			// Condition
			.setTextFont('16px Roboto')
			.setTextAlign('right')
			.addText(condition, 370, 142)

			// Titles
			.setTextFont("16px 'Roboto Condensed'")
			.addText(`${humidity}%`, 353, 100)
			.addText(`${chanceOfRain}%`, 353, 121)

			// Icons
			.addImage(conditionBuffer, 325, 31, 48, 48)
			.addImage(humidityBuffer, 358, 88, 13, 13)
			.addImage(precipicityBuffer, 358, 108, 13, 13)

			.toBufferAsync();

		return message.channel.sendFile(attachment, `${geoCodeLocation}.png`);
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
	state: string;
	condition: string;
	icon: string;
	chanceOfRain: number;
	temperature: number;
	humidity: number;
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
