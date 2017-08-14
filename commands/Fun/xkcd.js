const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const moment = require('moment');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            spam: true,

            cooldown: 10,

            description: 'Read comics from XKCD.'
        });
    }

    async run(msg, [input]) {
        let num;
        let query;

        if (input) {
            if (isNaN(input) === false) num = parseInt(input);
            else if (typeof input === 'string') query = input;
        }

        const number = await this.getNumber(num, query);
        const comic = await this.fetchURL(`http://xkcd.com/${number}/info.0.json`);

        const embed = new MessageEmbed()
            .setColor(0xD7CCC8)
            .setImage(comic.img)
            .setTitle(comic.title)
            .setURL(comic.link)
            .setFooter(`XKCD | ${comic.num} | ${this.getTime(comic.year, comic.month, comic.day)}`)
            .setDescription(comic.alt)
            .setTimestamp();

        return msg.send({ embed });
    }

    getTime(year, month, day) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return moment(date.getTime()).format('MMMM, dddd Do YYYY');
    }

    async getNumber(num, query) {
        const xkcdInfo = await this.fetchURL('http://xkcd.com/info.0.json');

        if (num) {
            if (num <= xkcdInfo.num) return num;
            throw Command.handleError(`there are only ${xkcdInfo.num} comics.`);
        }

        if (query) {
            const searchQuery = await this.fetchURL(`https://relevantxkcd.appspot.com/process?action=xkcd&query=${query}`);
            return searchQuery.split(' ')[2].replace('\n', '');
        }

        return Math.floor(Math.random() * (xkcdInfo.num - 1)) + 1;
    }

    fetchURL(url) {
        return snekfetch.get(url)
            .then(data => JSON.parse(data.text))
            .catch(Command.handleError);
    }

};
