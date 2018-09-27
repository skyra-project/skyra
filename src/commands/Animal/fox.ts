const { Command, util: { fetch } } = require('../../index');
const url = new URL('https://pixabay.com/api/');
url.searchParams.append('q', 'fox');
url.searchParams.append('safesearch', 'true');
url.searchParams.append('per_page', '200');
url.searchParams.append('image_type', 'photo');
url.searchParams.append('category', 'animals');
url.searchParams.append('key', require.main.exports.config.tokens.pixabay);

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_FOX_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_FOX_EXTENDED')
		});
		this.spam = true;
		this.hits = [];
	}

	public async run(msg: SkyraMessage) {
		const data = this.hits[Math.ceil(Math.random() * this.hits.length)];
		return msg.sendMessage(`${data.tags}\n${data.pageURL}`);
	}

	public async init() {
		const data = await fetch(url, 'json');
		const { hits } = data;
		for (let i = 0; i < hits.length; i++) {
			if (hits[i].type === 'photo')
				this.hits.push({ pageURL: hits[i].pageURL, tags: `**Tags**: ${hits[i].tags}` });
		}
	}

}
