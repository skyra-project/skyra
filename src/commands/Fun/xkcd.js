const { Command, Timestamp, MessageEmbed, util: { fetch } } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			cooldown: 10,
			description: (language) => language.get('COMMAND_XKCD_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_XKCD_EXTENDED'),
			usage: '[query:string]'
		});
		this.timestamp = new Timestamp('MMMM, dddd dd YYYY');
		this.spam = true;
	}

	async run(msg, [input]) {
		const query = typeof input !== 'undefined'
			? /^\d+$/.test(input) ? Number(input) : input : null;

		const comicNumber = await this.getNumber(query, msg.language);
		const comic = await fetch(`https://xkcd.com/${comicNumber}/info.0.json`, 'json')
			.catch(() => { throw msg.language.get('COMMAND_XKCD_NOTFOUND'); });

		return msg.sendEmbed(new MessageEmbed()
			.setColor(0xD7CCC8)
			.setImage(comic.img)
			.setTitle(comic.title)
			.setURL(comic.link)
			.setFooter(`XKCD | ${comic.num} | ${this.getTime(comic.year, comic.month, comic.day)}`)
			.setDescription(comic.alt)
			.setTimestamp());
	}

	getTime(year, month, day) {
		return this.timestamp.display(new Date(Number(year), Number(month) - 1, Number(day)));
	}

	async getNumber(query, i18n) {
		const xkcdInfo = await fetch('http://xkcd.com/info.0.json', 'json');

		if (typeof query === 'number') {
			if (query <= xkcdInfo.num) return query;
			throw i18n.get('COMMAND_XKCD_COMICS', xkcdInfo.num);
		}

		if (query) {
			const text = await fetch(`https://relevantxkcd.appspot.com/process?action=xkcd&query=${encodeURIComponent(query)}`, 'text');
			const comics = text.split(' ').slice(2);
			const random = Math.floor(Math.random() * (comics.length / 2));
			return parseInt(comics[random * 2].replace(/\n/g, ''));
		}

		return Math.floor(Math.random() * (xkcdInfo.num - 1)) + 1;
	}

};
