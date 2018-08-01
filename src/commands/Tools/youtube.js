const { Command, config: { tokens: { google: KEY } }, util: { fetch } } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			cooldown: 15,
			aliases: ['yt'],
			description: (language) => language.get('COMMAND_YOUTUBE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_YOUTUBE_EXTENDED'),
			usage: '<query:string> [index:integer{0,20}]',
			usageDelim: ' #'
		});
	}

	async run(msg, [input, ind = 1]) {
		const index = --ind;
		const data = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input)}&key=${KEY}&safeSearch=strict`, 'json');
		const result = data.items[index];

		if (!result) {
			throw msg.language.get(index === 0
				? 'COMMAND_YOUTUBE_NOTFOUND'
				: 'COMMAND_YOUTUBE_INDEX_NOTFOUND');
		}

		let output;
		switch (result.id.kind) {
			case 'youtube#channel': output = `https://youtube.com/channel/${result.id.channelId}`; break;
			case 'youtube#playlist': output = `https://www.youtube.com/playlist?list=${result.id.playlistId}`; break;
			case 'youtube#video': output = `https://youtu.be/${result.id.videoId}`; break;
			default: {
				this.client.emit('wtf', `YouTube [${input}] [${ind}] -> Returned incompatible kind '${result.id.kind}'.`);
				throw 'I found an incompatible kind of result...';
			}
		}

		return msg.sendMessage(output);
	}

};
