const { Command, PromptList, MessageEmbed, util: { fetch, oneToTen, cutText } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_MANGA_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_MANGA_EXTENDED'),
			usage: '<animeName:string>'
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
		const animeURL = `https://kitsu.io/anime/${entry.attributes.slug}`;
		const titles = msg.language.language.COMMAND_ANIME_TITLES;
		const type = entry.attributes.showType;
		const title = entry.attributes.titles.en || entry.attributes.titles.ja_jp;

		return msg.sendMessage(new MessageEmbed()
			.setColor(score.color)
			.setAuthor(title, entry.attributes.posterImage.tiny, animeURL)
			.setDescription(msg.language.get('COMMAND_MANGA_OUTPUT_DESCRIPTION', entry, synopsis))
			.addField(titles.TYPE, msg.language.get('COMMAND_MANGA_TITLES')[type.toUpperCase()] || type, true)
			.addField(titles.SCORE, `**${entry.attributes.averageRating}** / 100 ${score.emoji}`, true)
			.addField(titles.STATUS, msg.language.get('COMMAND_MANGA_OUTPUT_STATUS', entry))
			.addField(titles.WATCH_IT, `**[${title}](${animeURL})**`)
			.setFooter('© kitsu.io'));
	}

	async getIndex(msg, entries) {
		if (entries.length === 1) return entries[0];
		const _choice = await PromptList.run(msg, entries.slice(0, 10).map((entry) =>
			`(${entry.attributes.averageRating}) ${entry.attributes.titles.en || entry.attributes.titles.ja_jp}`));
		const entry = entries[_choice];
		if (!entry) throw msg.language.get('COMMAND_ANIME_INVALID_CHOICE');
		return entry;
	}

};
