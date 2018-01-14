const { Command } = require('klasa');
const URL = `https://pixabay.com/api/?q=fox&safesearch=true&per_page=200&image_type=photo&category=animals&key=${require.main.exports.config.tokens.pixabay}`;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_FOX_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_FOX_EXTENDED')
		});
		this.spam = true;
		this.hits = [];
	}

	async run(msg) {
		const data = this.hits[Math.ceil(Math.random() * this.hits.length)];
		return msg.send(`${data.tags}\n${data.pageURL}`);
	}

	async init() {
		const data = await this.fetchURL(URL, 'json');
		const hits = data.hits;
		for (let i = 0; i < hits.length; i++)
			if (hits[i].type === 'photo')
				this.hits.push({ pageURL: hits[i].pageURL, tags: `**Tags**: ${hits[i].tags}` });
	}

};
