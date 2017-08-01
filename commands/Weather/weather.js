const { Command, Constants } = require('../../index');
const { fillRoundRect } = require('../../functions/canvas');

const { join } = require('path');
const { readFile } = require('fs-nextra');
const snekfetch = require('snekfetch');
const Canvas = require('canvas');

/* Autentification */
const { GOOGLE_MAP_API, WEATHER_API } = Constants.getConfig.tokens;

const colors = {
    cloudy: '#88929F',
    day: '#6ABBD8',
    night: '#575D83',
    rain: '#457AD0',
    snow: '#FAFAFA',
    thunderstorm: '#99446B',
    windy: '#33B679'
};

/* eslint-disable class-methods-use-this */
module.exports = class Weather extends Command {

    constructor(...args) {
        super(...args, 'weather', {
            botPerms: ['ATTACH_FILES'],
            mode: 1,

            usage: '<city:string>',
            description: 'Check the weather status in a location.'
        });
    }

    query(url) {
        return snekfetch.get(url).then(d => JSON.parse(d.text));
    }

    async run(msg, [query]) {
        const locationURI = encodeURIComponent(query.replace(/ /g, '+'));
        const response = await this.query(`https://maps.googleapis.com/maps/api/geocode/json?address=${locationURI}&key=${GOOGLE_MAP_API}`);

        if (response.status !== 'OK') throw this.handleNotOK(msg, response.status);
        if (response.results.length === 0) throw 'your request returned no results.';

        const geocodelocation = response.results[0].formatted_address;
        const params = `${response.results[0].geometry.location.lat},${response.results[0].geometry.location.lng}`;

        const locality = response.results[0].address_components.find(loc => loc.types.includes('locality'));
        const governing = response.results[0].address_components.find(gov => gov.types.includes('administrative_area_level_1'));
        const country = response.results[0].address_components.find(cou => cou.types.includes('country'));
        const continent = response.results[0].address_components.find(con => con.types.includes('continent'));

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
        const canvas = new Canvas(400, 180);
        const cond = new Canvas.Image();
        const humid = new Canvas.Image();
        const precip = new Canvas.Image();
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.shadowColor = 'rgba(51, 51, 51, 0.38)';
        ctx.fillStyle = colors[this.timePicker(icon)];
        ctx.shadowBlur = 5;
        fillRoundRect(ctx, 10, 10, 380, 160, 5);
        ctx.restore();

        const [theme, fontColor] = ['snow', 'sleet', 'fog'].includes(icon) ? ['dark', '#444444'] : ['light', '#FFFFFF'];

        // City Name
        ctx.font = '20px Roboto';
        ctx.fillStyle = fontColor;
        ctx.fillText(city.long_name ? city.long_name : 'Unknown', 35, 50);

        // Prefecture Name
        ctx.font = '16px Roboto';
        ctx.fillStyle = theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(state.long_name ? state.long_name : '', 35, 72.5);

        // Temperature
        ctx.font = "48px 'Roboto Mono'";
        ctx.fillStyle = fontColor;
        ctx.fillText(`${temperature}°C`, 35, 140);

        // Condition
        ctx.font = '16px Roboto';
        ctx.textAlign = 'right';
        ctx.fillText(condition, 370, 142);

        // Titles
        ctx.font = "16px 'Roboto Condensed'";
        ctx.fillText(`${humidity}%`, 353, 100);
        ctx.fillText(`${chanceofrain}%`, 353, 121);

        const [conditionBuffer, humidityBuffer, precipicityBuffer] = await Promise.all([
            readFile(join(__dirname, '..', '..', 'assets', 'images', 'weather', theme, `${icon}.png`)),
            readFile(join(__dirname, '..', '..', 'assets', 'images', 'weather', theme, 'humidity.png')),
            readFile(join(__dirname, '..', '..', 'assets', 'images', 'weather', theme, 'precip.png'))
        ]);

        cond.src = conditionBuffer;
        humid.src = humidityBuffer;
        precip.src = precipicityBuffer;

        ctx.drawImage(cond, 325, 31);
        ctx.drawImage(humid, 358, 88);
        ctx.drawImage(precip, 358, 108);

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
