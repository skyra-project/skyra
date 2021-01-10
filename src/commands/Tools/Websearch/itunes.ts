import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { BrandingColors } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.ItunesDescription,
	extendedHelp: LanguageKeys.Commands.Tools.ItunesExtended,
	usage: '<song:str>'
})
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage, [song]: [string]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { results: entries } = await this.fetchAPI(t, song);
		if (!entries.length) throw t(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, t, entries);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(t: TFunction, song: string) {
		try {
			const url = new URL('https://itunes.apple.com/search');
			url.searchParams.append('country', 'US');
			url.searchParams.append('entity', 'song');
			url.searchParams.append('explicit', 'no');
			url.searchParams.append('lang', t.lng.toLowerCase());
			url.searchParams.append('limit', '10');
			url.searchParams.append('media', 'music');
			url.searchParams.append('term', song);

			return await fetch<AppleItunesResult>(url, FetchResultTypes.JSON);
		} catch {
			throw t(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, entries: ItunesData[]) {
		const titles = t(LanguageKeys.Commands.Tools.ItunesTitles);
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
					.addField(titles.trackReleaseDate, t(LanguageKeys.Globals.TimeDateValue, { value: new Date(song.releaseDate).getTime() }), true)
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
