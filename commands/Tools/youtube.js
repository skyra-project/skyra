const { structures: { Command }, config } = require('../../index');
const snekfetch = require('snekfetch');

const key = config.tokens.google;
const getURL = input => snekfetch.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${input}&key=${key}`)
	.then(data => JSON.parse(data.text));

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			mode: 1,
			cooldown: 15,

			usage: '<query:string> [index:integer{0,20}]',
			usageDelim: ' #',
			description: 'Search something throught YouTube.'
		});
	}

	async run(msg, [input, ind = 1], settings, i18n) {
		const index = --ind;
		const data = await getURL(encodeURIComponent(input));
		const result = data.items[index];

		if (!result)
			throw index === 0
				? i18n.get('COMMAND_YOUTUBE_NOTFOUND')
				: i18n.get('COMMAND_YOUTUBE_INDEX_NOTFOUND');

		const output = result.id.kind === 'youtube#channel'
			? `https://youtube.com/channel/${result.id.channelId}`
			: `https://youtu.be/${result.id.videoId}`;

		return msg.send(output);
	}

};
