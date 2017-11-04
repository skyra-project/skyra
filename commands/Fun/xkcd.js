const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const moment = require('moment');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			spam: true,

			cooldown: 10,

			usage: '[query:string]',
			description: 'Read comics from XKCD.',
			extend: {
				EXPLANATION: [
					'**xkcd** is an archive for nerd comics filled with math, science, sarcasm and languages. If you don\'t',
					'provide any argument, I will get a random comic from xkcd. If you provide a number, I will retrieve',
					'the comic with said number. But if you provide a title/text/topic, I will fetch a comic that matches',
					'with your input and display it. For example, `Skyra, xkcd Curiosity` will show the comic number 1091.'
				].join(' '),
				ARGUMENTS: '[query]',
				EXP_USAGE: [
					['query', 'Either the number of the comic, or a title to search for.']
				],
				EXAMPLES: [
					'1091',
					'Curiosity'
				]
			}
		});
	}

	async run(msg, [input], settings, i18n) {
		let num;
		let query;

		if (typeof input !== 'undefined') {
			if (isNaN(input) === false) num = parseInt(input);
			else if (typeof input === 'string') query = input;
		}

		const number = await this.getNumber(num, query, i18n);
		const comic = await this.fetchURL(`https://xkcd.com/${number}/info.0.json`);

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

	async getNumber(num, query, i18n) {
		const xkcdInfo = await this.fetchURL('http://xkcd.com/info.0.json');

		if (num) {
			if (num <= xkcdInfo.num) return num;
			throw i18n.get('COMMAND_XKCD_COMICS', xkcdInfo.num);
		}

		if (query) {
			const { text } = await snekfetch.get(`https://relevantxkcd.appspot.com/process?action=xkcd&query=${query}`);
			const comics = text.split(' ').slice(2);
			const random = Math.floor(Math.random() * (comics.length / 2));
			return comics[random * 2].replace(/\n/g, '');
		}

		return Math.floor(Math.random() * (xkcdInfo.num - 1)) + 1;
	}

	fetchURL(url) {
		return snekfetch.get(url)
			.then(data => JSON.parse(data.text));
	}

};
