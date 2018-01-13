const { Command } = require('klasa');
const { util, config } = require.main.exports;
const snekie = require('snekfetch');

const options = {
	headers: {
		Authorization: util.basicAuth(config.tokens.animelist.user,
			config.tokens.animelist.password)
	}
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			botPerms: ['EMBED_LINKS'],
			usage: '<animeName:string>',
			description: (msg) => msg.language.get('COMMAND_MANGA_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_MANGA_EXTENDED')
		});
	}

	async run(msg, [animeName]) {
		const data = await this.fetch(animeName)
			.catch(() => { throw msg.language.get('COMMAND_ANIME_QUERY_FAIL'); });
		const entry = await this.getIndex(msg, data.manga.entry);
		const synopsis = util.parseHTML(entry.synopsis[0]).replace(/\[\/?i\]/, '*').replace(/\n+/g, '\n\n');
		const score = util.oneToTen(Math.ceil(Number(entry.score[0])));
		const titles = msg.language.language.COMMAND_ANIME_TITLES;
		const url = `https://myanimelist.net/manga/${entry.id[0]}`;

		const embed = new this.client.methods.Embed()
			.setColor(score.color)
			.setAuthor(entry.title[0], entry.image && entry.image[0], url)
			.setDescription(msg.language.get('COMMAND_MANGA_OUTPUT_DESCRIPTION', entry, synopsis))
			.addField(titles.TYPE, msg.language.get('COMMAND_MANGA_TITLES')[entry.type[0].toUpperCase()] || entry.type[0], true)
			.addField(titles.SCORE, `**${entry.score}** / 10 ${score.emoji}`, true)
			.addField(titles.STATUS, msg.language.get('COMMAND_MANGA_OUTPUT_STATUS', entry))
			.addField(titles.READ_IT, `**[${entry.title[0]}](${url})**`)
			.setFooter('© MyAnimeList');

		return msg.sendMessage({ embed });
	}

	async getIndex(msg, entries) {
		const _choice = await msg.prompt(msg.language.get('COMMAND_ANIME_MULTIPLE_CHOICE', Math.min(entries.length, 10))
			+ this.client.methods.util.codeBlock('asciidoc', entries.slice(0, 10).map((entry, index) =>
				`${String(index + 1).padStart(2, ' ')} :: (${entry.score[0]}) ${entry.title[0]}`).join('\n')));
		const entry = entries[(Number(_choice) | 1) - 1];
		if (!entry) throw msg.language.get('COMMAND_ANIME_INVALID_CHOICE');
		return entry;
	}

	fetch(query) {
		return snekie.get(`https://myanimelist.net/api/manga/search.xml?q=${encodeURIComponent(query)}`, options)
			.then(result => util.xml2js(result.text));
	}

};
