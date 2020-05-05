import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { TOKENS } from '@root/config';
import { BrandingColors } from '@utils/constants';
import { cutText, fetch, FetchMethods, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { decode } from 'he';
import { CommandStore, KlasaMessage, Timestamp, util } from 'klasa';
import { stringify } from 'querystring';

const API_URL = `https://${TOKENS.NINTENDO_ID}-dsn.algolia.net/1/indexes/*/queries`;

export default class extends SkyraCommand {

	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_ESHOP_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_ESHOP_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<gameName:string>'
		});
	}

	public async run(message: KlasaMessage, [gameName]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const { results: entries } = await this.fetchAPI(message, gameName);
		if (!entries.length) throw message.language.tget('SYSTEM_NO_RESULTS');

		const display = this.buildDisplay(entries[0].hits, message);
		await display.start(response, message.author.id);
		return response;
	}

	private fetchAPI(message: KlasaMessage, gameName: string) {
		return fetch<EshopResult>(API_URL, {
			method: FetchMethods.Post,
			headers: {
				'Content-Type': 'application/json',
				'X-Algolia-API-Key': TOKENS.NINTENDO_KEY,
				'X-Algolia-Application-Id': TOKENS.NINTENDO_ID
			},
			body: JSON.stringify(
				{
					requests: [
						{
							indexName: 'noa_aem_game_en_us',
							params: stringify({
								facetFilters: [
									'type:game'
								],
								hitsPerPage: 10,
								maxValuesPerFacet: 30,
								page: 0,
								query: gameName
							})
						}
					]
				}
			)
		}, FetchResultTypes.JSON)
			.catch(() => { throw message.language.tget('SYSTEM_QUERY_FAIL'); });
	}

	private buildDisplay(entries: EShopHit[], message: KlasaMessage) {
		const titles = message.language.tget('COMMAND_ESHOP_TITLES');
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

		for (const game of entries) {
			const description = cutText(decode(game.description).replace(/\s\n {2,}/g, ' '), 750);
			const price = game.msrp ? message.language.tget('COMMAND_ESHOP_PRICE', game.msrp) : 'TBD';
			const esrbText = game.esrb
				? [
					`**${game.esrb}**`,
					game.esrbDescriptors && game.esrbDescriptors.length ? ` - ${game.esrbDescriptors.join(', ')}` : ''
				].join('')
				: message.language.tget('COMMAND_ESHOP_NOT_IN_DATABASE');

			display.addPage((embed: MessageEmbed) => embed
				.setTitle(game.title)
				.setURL(`https://nintendo.com${game.url}`)
				.setThumbnail(`https://nintendo.com${game.boxArt}`)
				.setDescription(description)
				.addField(titles.PRICE, price, true)
				.addField(titles.AVAILABILITY, game.availability[0], true)
				.addField(titles.RELEASE_DATE, game.releaseDateMask === 'TBD' ? game.releaseDateMask : this.releaseDateTimestamp.displayUTC(game.releaseDateMask), true)
				.addField(titles.NUMBER_OF_PLAYERS, util.toTitleCase(game.players), true)
				.addField(titles.PLATFORM, game.platform, true)
				.addField(titles.NSUID, game.nsuid || 'TBD', true)
				.addField(titles.ESRB, esrbText)
				.addField(titles.CATEGORIES, game.categories.join(', ') || titles.NO_CATEGORIES));
		}
		return display;
	}

}

interface EShopHit {
	type: string;
	locale: string;
	url: string;
	title: string;
	description: string;
	lastModified: number;
	id: string;
	nsuid: string;
	slug: string;
	boxArt: string;
	gallery: string;
	platform: string;
	releaseDateMask: string;
	characters: string[];
	categories: string[];
	msrp: number | null;
	esrb?: string;
	esrbDescriptors?: string[];
	virtualConsole: string;
	generalFilters: string[];
	filterShops: string[];
	filterPlayers: string[];
	publishers: string[];
	developers: string[];
	players: string;
	featured: boolean;
	freeToStart: boolean;
	priceRange: string | null;
	salePrice: number | null;
	availability: string[];
	objectID: string;
}


interface EshopData {
	hits: EShopHit[];
	nbHits: number;
	page: number;
	nbPages: number;
	hitsPerPage: number;
	processingTimeMS: number;
}

interface EshopResult {
	results: EshopData[];
}
