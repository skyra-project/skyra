const { structures: { Command }, config } = require('../../index');
const snekie = require('snekfetch');
const URL = `https://pixabay.com/api/?q=fox&safesearch=true&per_page=200&key=${config.tokens.pixabay}`;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			spam: true,
			cooldown: 10,

			description: 'Lemme show you a fox!'
		});

		this.hits = [];
	}

	async run(msg) {
		const data = this.hits[Math.ceil(Math.random() * this.hits.length)];
		return msg.send(`${data.tags}\n${data.pageURL}`);
	}

	async init() {
		const data = await this.fetchData();
		const hits = data.hits;
		for (let i = 0; i < hits.length; i++)
			if (hits[i].type === 'photo')
				this.hits.push({ pageURL: hits[i].pageURL, tags: `**Tags**: ${hits[i].tags}` });
	}

	fetchData() {
		return snekie.get(URL)
			.then(data => JSON.parse(data.text))
			.catch(Command.handleError);
	}

};
