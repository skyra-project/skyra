import { Canvas } from 'canvas-constructor';
import { readFile } from 'fs-nextra';
import { CommandStore, KlasaMessage } from 'klasa';
import { join } from 'path';
import { TOKENS } from '../../../config';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Events } from '../../lib/types/Enums';
import { fetch } from '../../lib/util/util';
import { assetsFolder } from '../../Skyra';

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
		const locationURI = encodeURIComponent(query.replace(/ /g, '+'));
		const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationURI}&key=${TOKENS.GOOGLE_MAP_API}`, 'json') as GoogleMapsResultOk;

		if (response.status !== 'OK') {
			throw message.language.tget(this.handleNotOK(response.status));
		}
		if (response.results.length === 0) {
			throw message.language.tget('COMMAND_WEATHER_ERROR_ZERO_RESULTS');
		}

		const geocodelocation = response.results[0].formatted_address;
		const params = `${response.results[0].geometry.location.lat},${response.results[0].geometry.location.lng}`;
		let locality: string;
		let governing: string;
		let country: string;
		let continent: string;

		for (const component of response.results[0].address_components) {
			if (!locality! && component.types.includes('locality')) locality = component.long_name;
			if (!governing! && component.types.includes('administrative_area_level_1')) governing = component.long_name;
			if (!country! && component.types.includes('country')) country = component.long_name;
			if (!continent! && component.types.includes('continent')) continent = component.long_name;
		}

		const city = locality! || governing! || country! || continent! || {};
		const localityOrCountry = locality! ? country! : {};
		const state = locality! && governing! ? governing! : localityOrCountry || {};

		const { currently } = await fetch(`https://api.darksky.net/forecast/${TOKENS.WEATHER_API}/${params}?exclude=minutely,hourly,flags&units=si`, 'json') as WeatherResultOk;

		const { icon } = currently;
		const condition = currently.summary;
		const chanceofrain = Math.round((currently.precipProbability * 100) / 5) * 5;
		const temperature = Math.round(currently.temperature);
		const humidity = Math.round(currently.humidity * 100);

		return this.draw(message, { geocodelocation, state, city, condition, icon, chanceofrain, temperature, humidity });
	}

	public async draw(message: KlasaMessage, { geocodelocation, state, city, condition, icon, chanceofrain, temperature, humidity }: WeatherData) {
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
			.addText(city.long_name ? city.long_name : 'Unknown', 35, 50)

			// Prefecture Name
			.setTextFont('16px Roboto')
			.setColor(theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')
			.addText(state.long_name ? state.long_name : '', 35, 72.5)

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
			.addText(`${chanceofrain}%`, 353, 121)

			// Icons
			.addImage(conditionBuffer, 325, 31, 48, 48)
			.addImage(humidityBuffer, 358, 88, 13, 13)
			.addImage(precipicityBuffer, 358, 108, 13, 13)

			.toBufferAsync();

		return message.channel.send({ files: [{ attachment, name: `${geocodelocation}.png` }] }) as Promise<KlasaMessage | KlasaMessage[]>;
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

	public handleNotOK(status: string) {
		switch (status) {
			case 'ZERO_RESULTS':
				return 'COMMAND_WEATHER_ERROR_ZERO_RESULTS';
			case 'REQUEST_DENIED':
				return 'COMMAND_WEATHER_ERROR_REQUEST_DENIED';
			case 'INVALID_REQUEST':
				return 'COMMAND_WEATHER_ERROR_INVALID_REQUEST';
			case 'OVER_QUERY_LIMIT':
				return 'COMMAND_WEATHER_ERROR_OVER_QUERY_LIMIT';
			default:
				this.client.emit(Events.Wtf, `Weather::handleNotOK | Unknown Error: ${status}`);
				return 'COMMAND_WEATHER_ERROR_UNKNOWN';
		}
	}

}

interface WeatherData {
	geocodelocation: string;
	state: Record<string, string>;
	city: Record<string, string>;
	condition: string;
	icon: string;
	chanceofrain: number;
	temperature: number;
	humidity: number;
}

export interface GoogleMapsResultOk {
	results: GoogleMapsResultOkResult[];
	status: string;
}

export interface GoogleMapsResultOkResult {
	address_components: GoogleMapsOkAddressComponent[];
	formatted_address: string;
	geometry: GoogleMapsOkGeometry;
	place_id: string;
	types: string[];
}

export interface GoogleMapsOkAddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

export interface GoogleMapsOkGeometry {
	bounds: GoogleMapsOkBounds;
	location: GoogleMapsOkLocation;
	location_type: string;
	viewport: GoogleMapsOkBounds;
}

export interface GoogleMapsOkBounds {
	northeast: GoogleMapsOkLocation;
	southwest: GoogleMapsOkLocation;
}

export interface GoogleMapsOkLocation {
	lat: number;
	lng: number;
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
