const { Command } = require('klasa');
const { PromptList, util, config } = require('../../index');

const options = { headers: {
	Authorization: util.basicAuth(config.tokens.animelist.user,
		config.tokens.animelist.password)
} };

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['EMBED_LINKS'],
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_ANIME_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_ANIME_EXTENDED'),
			usage: '<animeName:string>'
		});
	}

	async run(msg, [animeName]) {
		const data = await this.fetchURL(`https://myanimelist.net/api/anime/search.xml?q=${encodeURIComponent(animeName)}`, options, 'xml')
			.catch(() => { throw msg.language.get('COMMAND_ANIME_QUERY_FAIL'); });
		const entry = await this.getIndex(msg, data.anime.entry)
			.catch(error => { throw error || msg.language.get('COMMAND_ANIME_NO_CHOICE'); });
		const synopsis = util.parseHTML(entry.synopsis[0]).replace(/\[\/?i\]/, '*').replace(/\n+/g, '\n\n');
		const score = util.oneToTen(Math.ceil(Number(entry.score[0])));
		const titles = msg.language.language.COMMAND_ANIME_TITLES;
		const url = `https://myanimelist.net/anime/${entry.id[0]}`;

		const embed = new this.client.methods.Embed()
			.setColor(score.color)
			.setAuthor(entry.title[0], entry.image && entry.image[0], url)
			.setDescription(msg.language.get('COMMAND_MANGA_OUTPUT_DESCRIPTION', entry, synopsis))
			.addField(titles.TYPE, msg.language.get('COMMAND_ANIME_TYPES')[entry.type[0].toUpperCase()] || entry.type[0], true)
			.addField(titles.SCORE, `**${entry.score}** / 10 ${score.emoji}`, true)
			.addField(titles.STATUS, msg.language.get('COMMAND_ANIME_OUTPUT_STATUS', entry))
			.addField(titles.WATCH_IT, `**[${entry.title[0]}](${url})**`)
			.setFooter('© MyAnimeList');

		return msg.sendMessage({ embed });
	}

	async getIndex(msg, entries) {
		const _choice = await PromptList.run(msg, entries.slice(0, 10).map((entry) =>
			`(${entry.score[0]}) ${entry.title[0]}`));
		const entry = entries[_choice];
		if (!entry) throw msg.language.get('COMMAND_ANIME_INVALID_CHOICE');
		return entry;
	}

};
