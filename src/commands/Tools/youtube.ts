import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { URL } from 'url';
import { TOKENS } from '../../../config';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { Events } from '../../lib/types/Enums';
import { fetch } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['yt'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_YOUTUBE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_YOUTUBE_EXTENDED'),
			usage: '<query:string> [index:integer{0,20}]',
			usageDelim: ' #'
		});
	}

	public async run(message: KlasaMessage, [input, ind = 1]: [string, number]) {
		const index = --ind;
		const url = new URL('https://www.googleapis.com/youtube/v3/search');
		url.searchParams.append('part', 'snippet');
		url.searchParams.append('safeSearch', 'strict');
		url.searchParams.append('q', input);
		url.searchParams.append('key', TOKENS.GOOGLE_API);
		const data = await fetch(url, 'json');
		const result = data.items[index];

		if (!result) {
			throw message.language.get(index === 0
				? 'COMMAND_YOUTUBE_NOTFOUND'
				: 'COMMAND_YOUTUBE_INDEX_NOTFOUND');
		}

		let output;
		switch (result.id.kind) {
			case 'youtube#channel': output = `https://youtube.com/channel/${result.id.channelId}`; break;
			case 'youtube#playlist': output = `https://www.youtube.com/playlist?list=${result.id.playlistId}`; break;
			case 'youtube#video': output = `https://youtu.be/${result.id.videoId}`; break;
			default: {
				this.client.emit(Events.Wtf, `YouTube [${input}] [${ind}] -> Returned incompatible kind '${result.id.kind}'.`);
				throw 'I found an incompatible kind of result...';
			}
		}

		return message.sendMessage(output);
	}

}
