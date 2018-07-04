const { Command, config: { tokens: { GOOGLE_MAP_API, WEATHER_API } }, assetsFolder, util: { fetch } } = require('../../index');
const { Canvas } = require('canvas-constructor');
const { join } = require('path');
const { readFile } = require('fs-nextra');

const COLORS = {
	cloudy: '#88929F',
	day: '#6ABBD8',
	night: '#575D83',
	rain: '#457AD0',
	snow: '#FAFAFA',
	thunderstorm: '#99446B',
	windy: '#33B679'
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 120,
			description: msg => msg.language.get('COMMAND_WEATHER_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_WEATHER_EXTENDED'),
			usage: '<city:string>'
		});
	}

	async run(msg, [query]) {
		const locationURI = encodeURIComponent(query.replace(/ /g, '+'));
		const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationURI}&key=${GOOGLE_MAP_API}`, 'json');

		if (response.status !== 'OK')
			throw msg.language.get(this.handleNotOK(msg, response.status));
		if (response.results.length === 0)
			throw msg.language.get('COMMAND_WEATHER_ERROR_ZERO_RESULTS');

		const geocodelocation = response.results[0].formatted_address;
		const params = `${response.results[0].geometry.location.lat},${response.results[0].geometry.location.lng}`;
		let locality, governing, country, continent;

		for (const component of response.results[0].address_components) {
			if (!locality && component.types.includes('locality')) locality = component;
			if (!governing && component.types.includes('administrative_area_level_1')) governing = component;
			if (!country && component.types.includes('country')) country = component;
			if (!continent && component.types.includes('continent')) continent = component;
		}

		const city = locality || governing || country || continent || {};
		const localityOrCountry = locality ? country : {};
		const state = locality && governing ? governing : localityOrCountry;

		const { currently } = await fetch(`https://api.darksky.net/forecast/${WEATHER_API}/${params}?exclude=minutely,hourly,flags&units=si`, 'json');

		const { icon } = currently;
		const condition = currently.summary;
		const chanceofrain = Math.round((currently.precipProbability * 100) / 5) * 5;
		const temperature = Math.round(currently.temperature);
		const humidity = Math.round(currently.humidity * 100);

		return this.draw(msg, { geocodelocation, state, city, condition, icon, chanceofrain, temperature, humidity });
	}

	async draw(msg, { geocodelocation, state, city, condition, icon, chanceofrain, temperature, humidity }) {
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

		return msg.channel.send({ files: [{ attachment, name: `${geocodelocation}.png` }] });
	}

	timePicker(icon) {
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

	handleNotOK(status) {
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
				this.client.emit('log', `Weather::handleNotOK | Unknown Error: ${status}`);
				return 'COMMAND_WEATHER_ERROR_UNKNOWN';
		}
	}

};
