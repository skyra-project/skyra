import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { Timestamp } from '@sapphire/time-utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { Language } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Tools.ItunesDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.ItunesExtended),
	usage: '<song:str>'
})
export default class extends RichDisplayCommand {
	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public async run(message: GuildMessage, [song]: [string]) {
		const language = await message.fetchLanguage();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { results: entries } = await this.fetchAPI(language, song);
		if (!entries.length) throw language.get(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, language, entries);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(language: Language, song: string) {
		try {
			const url = new URL('https://itunes.apple.com/search');
			url.searchParams.append('country', 'US');
			url.searchParams.append('entity', 'song');
			url.searchParams.append('explicit', 'no');
			url.searchParams.append('lang', language.name.toLowerCase());
			url.searchParams.append('limit', '10');
			url.searchParams.append('media', 'music');
			url.searchParams.append('term', song);

			return await fetch<AppleItunesResult>(url, FetchResultTypes.JSON);
		} catch {
			throw language.get(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, language: Language, entries: ItunesData[]) {
		const titles = language.get(LanguageKeys.Commands.Tools.ItunesTitles);
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		for (const song of entries) {
			display.addPage((embed: MessageEmbed) =>
				embed
					.setThumbnail(song.artworkUrl100)
					.setTitle(song.trackName)
					.setURL(song.trackViewUrl)
					.addField(titles.artist, `[${song.artistName}](${song.artistViewUrl})`, true)
					.addField(titles.collection, `[${song.collectionName}](${song.collectionViewUrl})`, true)
					.addField(titles.collectionPrice, `$${song.collectionPrice}`, true)
					.addField(titles.trackPrice, `$${song.trackPrice}`, true)
					.addField(titles.trackReleaseDate, this.releaseDateTimestamp.displayUTC(song.releaseDate), true)
					.addField(titles.numberOfTracksInCollection, song.trackCount, true)
					.addField(titles.primaryGenre, song.primaryGenreName, true)
					.addField(titles.preview, `[${titles.previewLabel}](${song.previewUrl})`, true)
			);
		}

		return display;
	}
}

interface ItunesData {
	artistId: number;
	artistName: string;
	artistViewUrl: string;
	artworkUrl100: string;
	artworkUrl30: string;
	artworkUrl60: string;
	collectionCensoredName: string;
	collectionExplicitness: 'explicit' | string;
	collectionId: number;
	collectionName: string;
	collectionPrice: number;
	collectionViewUrl: string;
	country: string;
	currency: string;
	discCount: number;
	discNumber: number;
	isStreamable: boolean;
	kind: 'song' | string;
	previewUrl: string;
	primaryGenreName: string;
	releaseDate: string;
	trackCensoredName: string;
	trackCount: number;
	trackExplicitness: 'notExplicit' | string;
	trackId: number;
	trackName: string;
	trackNumber: number;
	trackPrice: number;
	trackTimeMillis: number;
	trackViewUrl: string;
	wrapperType: 'track' | string;
}

interface AppleItunesResult {
	results: ItunesData[];
	resultCount: number;
}
