const { Command, PromptList, MessageEmbed, util: { fetch, oneToTen, cutText } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_MANGA_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_MANGA_EXTENDED'),
			usage: '<mangaName:string>'
		});
	}

	async run(msg, [mangaName]) {
		const url = new URL('https://kitsu.io/api/edge/manga');
		url.search = new URLSearchParams([['filter[text]', mangaName]]);

		const body = await fetch(url, 'json')
			.catch(() => { throw msg.language.get('COMMAND_ANIME_QUERY_FAIL'); });

		const entry = await this.getIndex(msg, body.data)
			.catch(error => { throw error || msg.language.get('COMMAND_ANIME_NO_CHOICE'); });

		const synopsis = cutText(entry.attributes.synopsis, 750);
		const score = oneToTen(Math.ceil(Number(entry.attributes.averageRating) / 10));
		const mangaURL = `https://kitsu.io/manga/${entry.attributes.slug}`;
		const titles = msg.language.language.COMMAND_ANIME_TITLES;
		const type = entry.attributes.mangaType;
		const title = entry.attributes.titles.en || entry.attributes.titles.en_jp || entry.attributes.titles.ja_jp;

		return msg.sendEmbed(new MessageEmbed()
			.setColor(score.color)
			.setAuthor(title, entry.attributes.posterImage.tiny, mangaURL)
			.setDescription(msg.language.get('COMMAND_MANGA_OUTPUT_DESCRIPTION', entry, synopsis))
			.addField(titles.TYPE, msg.language.get('COMMAND_MANGA_TITLES')[type.toUpperCase()] || type, true)
			.addField(titles.SCORE, `**${entry.attributes.averageRating}** / 100 ${score.emoji}`, true)
			.addField(titles.STATUS, msg.language.get('COMMAND_MANGA_OUTPUT_STATUS', entry))
			.addField(titles.READ_IT, `**[${title}](${mangaURL})**`)
			.setFooter('© kitsu.io'));
	}

	async getIndex(msg, entries) {
		if (entries.length === 1) return entries[0];
		const _choice = await PromptList.run(msg, entries.slice(0, 10).map((entry) => {
			if (entry.attributes.averageRating === null) entry.attributes.averageRating = this.extractAverage(entry);
			return `(${entry.attributes.averageRating}) ${this.extractTitle(entry.attributes.titles)}`;
		}));
		const entry = entries[_choice];
		if (!entry) throw msg.language.get('COMMAND_ANIME_INVALID_CHOICE');
		return entry;
	}

	extractTitle(titles) {
		return Object.values(titles).find(Boolean);
	}

	extractAverage(entry) {
		let total = 0, max = 0;
		for (const array of Object.entries(entry.attributes.ratingFrequencies)) {
			const [key, value] = array.map(Number);
			total += key * value;
			max += value;
		}

		return ((total / (max * 20)) * 100).toFixed(2);
	}

};
