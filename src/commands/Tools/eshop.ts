import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp, util } from 'klasa';
import { stringify } from 'querystring';
import { TOKENS } from '../../../config';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { cutText, fetch, getColor } from '../../lib/util/util';
import { decode } from 'he';

export default class extends SkyraCommand {

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
			.setColor(getColor(message) || 0xFFAB2D));

		const { results: entries } = await fetch(`https://${TOKENS.NINTENDO.ID}-dsn.algolia.net/1/indexes/*/queries`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Algolia-API-Key': TOKENS.NINTENDO.KEY,
				'X-Algolia-Application-Id': TOKENS.NINTENDO.ID
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
		}, 'json')
			.catch(() => { throw message.language.tget('SYSTEM_QUERY_FAIL'); }) as EshopResult;

		const display = this.buildDisplay(entries[0].hits);

		await display.start(response, message.author.id);
		return response;
	}

	private buildDisplay(entries: EShopHit[]) {
		const display = new UserRichDisplay();

		for (const game of entries) {
			const description = decode(cutText(game.description.replace(/\s\n {2,}/g, ' '), 750));
			let price = 'Free';
			if (game.msrp && game.msrp > 0) price = `$${game.msrp} USD`;


			display.addPage(
				new MessageEmbed()
					.setColor('#FFA600')
					.setTitle(game.title)
					.setURL(`https://nintendo.com${game.url}`)
					.setThumbnail(`https://nintendo.com${game.boxArt}`)
					.setDescription(description)
					.addField('Price', price, true)
					.addField('Availability', game.availability[0], true)
					.addField('Release Date', game.releaseDateMask === 'TBD' ? game.releaseDateMask : new Timestamp('MMMM d YYYY').displayUTC(game.releaseDateMask), true)
					.addField('Number of Players', util.toTitleCase(game.players), true)
					.addField('Platform', game.platform, true)
					.addField('NSUID', game.nsuid ? game.nsuid : 'TBD', true)
					.addField('ESRB', game.esrb ? `**${game.esrb}** - ${game.esrbDescriptors.join(', ')}` : 'Not in database')
					.addField('Categories', game.categories.join(', '))
			);
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
	esrbDescriptors: string[];
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
