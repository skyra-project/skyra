const { Command, config } = require('../../index');
const Canvas = require('../../utils/canvas-constructor');

const { join } = require('path');
const { readFile } = require('fs-nextra');
const snekfetch = require('snekfetch');

/* Autentification */
const { GOOGLE_MAP_API, WEATHER_API } = config.tokens;

const colors = {
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
            botPerms: ['ATTACH_FILES'],
            mode: 1,
            cooldown: 120,

            usage: '<city:string>',
            description: 'Check the weather status in a location.'
        });
    }

    query(url) {
        return snekfetch.get(url)
            .then(data => JSON.parse(data.text));
    }

    async run(msg, [query]) {
        const locationURI = encodeURIComponent(query.replace(/ /g, '+'));
        const response = await this.query(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationURI}&key=${GOOGLE_MAP_API}`);

        if (response.status !== 'OK') throw this.handleNotOK(msg, response.status);
        if (response.results.length === 0) throw 'your request returned no results.';

        const geocodelocation = response.results[0].formatted_address;
        const params = `${response.results[0].geometry.location.lat},${response.results[0].geometry.location.lng}`;

        let locality;
        let governing;
        let country;
        let continent;

        for (const component of response.results[0].address_components) {
            if (!locality && component.types.includes('locality')) locality = component;
            if (!governing && component.types.includes('administrative_area_level_1')) governing = component;
            if (!country && component.types.includes('country')) country = component;
            if (!continent && component.types.includes('continent')) continent = component;
        }

        const city = locality || governing || country || continent || {};
        const localityOrCountry = locality ? country : {};
        const state = locality && governing ? governing : localityOrCountry;

        const res = await this.query(`https://api.darksky.net/forecast/${WEATHER_API}/${params}?exclude=minutely,hourly,flags&units=si`);

        const condition = res.currently.summary;
        const icon = res.currently.icon;
        const chanceofrain = Math.round((res.currently.precipProbability * 100) / 5) * 5;
        const temperature = Math.round(res.currently.temperature);
        const humidity = Math.round(res.currently.humidity * 100);

        return this.draw(msg, { geocodelocation, state, city, condition, icon, chanceofrain, temperature, humidity });
    }

    async draw(msg, { geocodelocation, state, city, condition, icon, chanceofrain, temperature, humidity }) {
        const [theme, fontColor] = ['snow', 'sleet', 'fog'].includes(icon) ? ['dark', '#444444'] : ['light', '#FFFFFF'];
        const [conditionBuffer, humidityBuffer, precipicityBuffer] = await Promise.all([
            readFile(join(__dirname, '..', '..', 'assets', 'images', 'weather', theme, `${icon}.png`)),
            readFile(join(__dirname, '..', '..', 'assets', 'images', 'weather', theme, 'humidity.png')),
            readFile(join(__dirname, '..', '..', 'assets', 'images', 'weather', theme, 'precip.png'))
        ]);

        const canvas = new Canvas(400, 180)
            .save()
            .setShadowColor('rgba(51,51,51,.38)')
            .setShadowBlur(5)
            .setColor(colors[this.timePicker(icon)])
            .createBeveledClip(10, 10, 380, 160, 5)
            .addRect(10, 10, 380, 160)
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
            .addImage(precipicityBuffer, 358, 108, 13, 13);

        return msg.channel.send({ files: [{ attachment: canvas.toBuffer(), name: `${geocodelocation}.png` }] });
    }

    timePicker(icon) {
        if (icon === 'clear-day' || icon === 'partly-cloudy-day') return 'day';
        else if (icon === 'clear-night' || icon === 'partly-cloudy-night') return 'night';
        else if (icon === 'rain') return 'rain';
        else if (icon === 'thunderstorm') return 'thunderstorm';
        else if (icon === 'snow' || icon === 'sleet' || icon === 'fog') return 'snow';
        else if (icon === 'wind' || icon === 'tornado') return 'windy';
        return 'cloudy';
    }

    handleNotOK(status) {
        if (status === 'ZERO_RESULTS') return 'your request returned no results.';
        else if (status === 'REQUEST_DENIED') return 'Geocode API Request was denied.';
        else if (status === 'INVALID_REQUEST') return 'Invalid Request,';
        else if (status === 'OVER_QUERY_LIMIT') return 'Query Limit Exceeded. Try again tomorrow.';
        return 'Unknown.';
    }

};
