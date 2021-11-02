import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { Args, IArgument } from '@sapphire/framework';
import type { Message, MessageSelectOptionData } from 'discord.js';
import { decode } from 'he';
import { URL } from 'url';

@ApplyOptions<PaginatedMessageCommand.Options>({
	enabled: envIsDefined('GOOGLE_API_TOKEN'),
	aliases: ['yt'],
	description: LanguageKeys.Commands.Tools.YouTubeDescription,
	detailedDescription: LanguageKeys.Commands.Tools.YouTubeExtended
})
export class UserCommand extends PaginatedMessageCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const { t } = args;
		const loadingMessage = await sendLoadingMessage(message, t);

		const input = await args.rest(UserCommand.youtubeUrlResolver);

		const url = new URL('https://youtube.googleapis.com/youtube/v3/search');
		url.searchParams.append('part', 'snippet');
		url.searchParams.append('safeSearch', 'strict');
		url.searchParams.append('q', input);
		url.searchParams.append('key', process.env.GOOGLE_API_TOKEN);

		const data = await fetch<YouTubeResultOk>(url, FetchResultTypes.JSON);
		const results = data.items.slice(0, 10);

		if (!results.length) this.error(LanguageKeys.Commands.Tools.YouTubeNotFound);

		const pageLabel = t(LanguageKeys.Globals.PaginatedMessagePage);

		const display = new SkyraPaginatedMessage() //
			.setSelectMenuOptions((pageIndex) => this.getSelectMenuOptions(results, pageIndex, pageLabel));

		for (const result of results) {
			display.addPageBuilder((builder) =>
				builder //
					.setContent(this.getLink(result))
					.setEmbeds([])
			);
		}

		await display.run(loadingMessage, message.author);
		return loadingMessage;
	}

	private getLink(result: YouTubeResultOkItem): string {
		switch (result.id.kind) {
			case 'youtube#channel':
				return `https://youtube.com/channel/${result.id.channelId}`;
			case 'youtube#playlist':
				return `https://www.youtube.com/playlist?list=${result.id.playlistId}`;
			case 'youtube#video':
				return `https://youtu.be/${result.id.videoId}`;
			default: {
				this.container.logger.fatal(`YouTube -> Returned incompatible kind '${result.id.kind}'.`);
				throw 'I found an incompatible kind of result...';
			}
		}
	}

	private getSelectMenuOptions(results: YouTubeResultOkItem[], pageIndex: number, pageLabel: string): Omit<MessageSelectOptionData, 'value'> {
		const result = results[pageIndex - 1];

		if (result.snippet.title) {
			return {
				label: `${decode(result.snippet.title)}`
			};
		}

		return {
			label: `${pageLabel} ${pageIndex}`
		};
	}

	private static youtubeUrlResolver: IArgument<string> = Args.make((parameter) => {
		if (parameter.startsWith('<')) parameter = parameter.slice(1);
		if (parameter.endsWith('>')) parameter = parameter.slice(0, parameter.length - 1);

		return Args.ok(parameter);
	});
}

interface YouTubeResultOk {
	kind: string;
	etag: string;
	nextPageToken: string;
	regionCode: string;
	pageInfo: YouTubeResultOkPageInfo;
	items: YouTubeResultOkItem[];
}

interface YouTubeResultOkItem {
	kind: string;
	etag: string;
	id: YouTubeResultOkId;
	snippet: YouTubeResultOkSnippet;
}

interface YouTubeResultOkId {
	kind: string;
	playlistId?: string;
	channelId?: string;
	videoId?: string;
}

interface YouTubeResultOkSnippet {
	publishedAt: Date;
	channelId: string;
	title: string;
	description: string;
	thumbnails: YouTubeResultOkThumbnails;
	channelTitle: string;
	liveBroadcastContent: string;
}

interface YouTubeResultOkThumbnails {
	default: YouTubeResultOkThumbnail;
	medium: YouTubeResultOkThumbnail;
	high: YouTubeResultOkThumbnail;
}

interface YouTubeResultOkThumbnail {
	url: string;
	width: number;
	height: number;
}

interface YouTubeResultOkPageInfo {
	totalResults: number;
	resultsPerPage: number;
}
