import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events } from '@lib/types/Enums';
import { TOKENS } from '@root/config';
import { fetch, FetchResultTypes } from '@utils/util';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['yt'],
			cooldown: 15,
			description: language => language.tget('COMMAND_YOUTUBE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_YOUTUBE_EXTENDED'),
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
		url.searchParams.append('key', TOKENS.GOOGLE_API_KEY);
		const data = await fetch<YouTubeResultOk>(url, FetchResultTypes.JSON);
		const result = data.items[index];

		if (!result) {
			throw message.language.tget(index === 0
				? 'COMMAND_YOUTUBE_NOTFOUND'
				: 'COMMAND_YOUTUBE_INDEX_NOTFOUND');
		}

		let output = '';
		switch (result.id.kind) {
			case 'youtube#channel': output = `https://youtube.com/channel/${result.id.channelId}`;
				break;
			case 'youtube#playlist': output = `https://www.youtube.com/playlist?list=${result.id.playlistId}`;
				break;
			case 'youtube#video': output = `https://youtu.be/${result.id.videoId}`;
				break;
			default: {
				this.client.emit(Events.Wtf, `YouTube [${input}] [${ind}] -> Returned incompatible kind '${result.id.kind}'.`);
				throw 'I found an incompatible kind of result...';
			}
		}

		return message.sendMessage(output);
	}

}

export interface YouTubeResultOk {
	kind: string;
	etag: string;
	nextPageToken: string;
	regionCode: string;
	pageInfo: YouTubeResultOkPageInfo;
	items: YouTubeResultOkItem[];
}

export interface YouTubeResultOkItem {
	kind: string;
	etag: string;
	id: YouTubeResultOkID;
	snippet: YouTubeResultOkSnippet;
}

export interface YouTubeResultOkID {
	kind: string;
	playlistId?: string;
	channelId?: string;
	videoId?: string;
}

export interface YouTubeResultOkSnippet {
	publishedAt: Date;
	channelId: string;
	title: string;
	description: string;
	thumbnails: YouTubeResultOkThumbnails;
	channelTitle: string;
	liveBroadcastContent: string;
}

export interface YouTubeResultOkThumbnails {
	default: YouTubeResultOkThumbnail;
	medium: YouTubeResultOkThumbnail;
	high: YouTubeResultOkThumbnail;
}

export interface YouTubeResultOkThumbnail {
	url: string;
	width: number;
	height: number;
}

export interface YouTubeResultOkPageInfo {
	totalResults: number;
	resultsPerPage: number;
}
