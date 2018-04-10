const { Command, config: { tokens: { google: KEY } } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 15,
			aliases: ['yt'],
			description: msg => msg.language.get('COMMAND_YOUTUBE_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_YOUTUBE_EXTENDED'),
			usage: '<query:string> [index:integer{0,20}]',
			usageDelim: ' #'
		});
	}

	async run(msg, [input, ind = 1]) {
		const index = --ind;
		const data = await this.fetchURL(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input)}&key=${KEY}`, 'json');
		const result = data.items[index];

		if (!result) throw msg.language.get(index === 0
			? 'COMMAND_YOUTUBE_NOTFOUND'
			: 'COMMAND_YOUTUBE_INDEX_NOTFOUND');

		const output = result.id.kind === 'youtube#channel'
			? `https://youtube.com/channel/${result.id.channelId}`
			: `https://youtu.be/${result.id.videoId}`;

		return msg.sendMessage(output);
	}

};
