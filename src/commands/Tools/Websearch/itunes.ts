import { CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { fetch, getColor } from '../../../lib/util/util';
import { MessageEmbed } from 'discord.js';
import { BrandingColors } from '../../../lib/util/constants';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';

export default class extends SkyraCommand {

	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_ITUNES_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_ITUNES_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<song:str>'
		});
	}

	public async run(message: KlasaMessage, [song]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const { results: entries } = await this.fetchAPI(message, song);
		if (!entries.length) throw message.language.tget('SYSTEM_NO_RESULTS');

		const display = this.buildDisplay(entries, message);
		await display.start(response, message.author.id);
		return response;
	}

	private fetchAPI(message: KlasaMessage, song: string) {
		const url = new URL('https://itunes.apple.com/search');
		url.searchParams.append('country', 'US');
		url.searchParams.append('entity', 'song');
		url.searchParams.append('explicit', 'no');
		url.searchParams.append('lang', message.language.name.toLowerCase());
		url.searchParams.append('limit', '10');
		url.searchParams.append('media', 'music');
		url.searchParams.append('term', song);

		return fetch(url, 'json')
			.catch(() => { throw message.language.tget('SYSTEM_QUERY_FAIL'); }) as Promise<ITunesResult>;
	}

	private buildDisplay(entries: ItunesData[], message: KlasaMessage) {
		const titles = message.language.tget('COMMAND_ITUNES_TITLES');
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

		for (const song of entries) {

			display.addPage((embed: MessageEmbed) => embed
				.setThumbnail(song.artworkUrl100)
				.setTitle(song.trackName)
				.setURL(song.trackViewUrl)
				.addField(titles.ARTIST, `[${song.artistName}](${song.artistViewUrl})`, true)
				.addField(titles.COLLECTION, `[${song.collectionName}](${song.collectionViewUrl})`, true)
				.addField(titles.COLLECTION_PRICE, `$${song.collectionPrice}`, true)
				.addField(titles.TRACK_PRICE, `$${song.trackPrice}`, true)
				.addField(titles.TRACK_RELEASE_DATE, this.releaseDateTimestamp.displayUTC(song.releaseDate), true)
				.addField(titles.NUMBER_OF_TRACKS_IN_COLLECTION, song.trackCount, true)
				.addField(titles.PRIMARY_GENRE, song.primaryGenreName, true)
				.addField(titles.PREVIEW, `[${titles.PREVIEW_LABEL}](${song.previewUrl})`, true));
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

interface ITunesResult {
	results: ItunesData[];
	resultCount: number;
}
