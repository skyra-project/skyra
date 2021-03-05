import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { TOKENS } from '#root/config';
import { Mime } from '#utils/constants';
import { fetch, FetchMethods, FetchResultTypes, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { cutText, toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import { decode } from 'he';
import type { TFunction } from 'i18next';
import { stringify } from 'querystring';

const API_URL = `https://${TOKENS.NINTENDO_ID}-dsn.algolia.net/1/indexes/ncom_game_en_us/query`;

@ApplyOptions<PaginatedMessageCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.EshopDescription,
	extendedHelp: LanguageKeys.Commands.Tools.EshopExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const gameName = await args.rest('string');

		const response = await sendLoadingMessage(message, args.t);

		const { hits } = await this.fetchAPI(gameName);
		if (!hits.length) this.error(LanguageKeys.System.QueryFail);

		const display = await this.buildDisplay(message, args.t, hits);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async fetchAPI(gameName: string) {
		try {
			return fetch<EshopResult>(
				API_URL,
				{
					method: FetchMethods.Post,
					headers: {
						'Content-Type': Mime.Types.ApplicationJson,
						'X-Algolia-API-Key': TOKENS.NINTENDO_KEY,
						'X-Algolia-Application-Id': TOKENS.NINTENDO_ID
					},
					body: JSON.stringify({
						params: stringify({
							hitsPerPage: 10,
							page: 0,
							query: gameName
						})
					})
				},
				FetchResultTypes.JSON
			);
		} catch {
			this.error(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, entries: EShopHit[]) {
		const titles = t(LanguageKeys.Commands.Tools.EshopTitles);
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await DbSet.fetchColor(message)) });

		for (const game of entries) {
			const description = cutText(decode(game.description).replace(/\s\n {2,}/g, ' '), 750);
			const price = game.msrp
				? game.msrp > 0
					? t(LanguageKeys.Commands.Tools.EshopPricePaid, { price: game.msrp })
					: t(LanguageKeys.Commands.Tools.EshopPriceFree)
				: 'TBD';
			const esrbText = game.esrbRating
				? [`**${game.esrbRating}**`, game.esrbDescriptors && game.esrbDescriptors.length ? ` - ${game.esrbDescriptors.join(', ')}` : ''].join(
						''
				  )
				: t(LanguageKeys.Commands.Tools.EshopNotInDatabase);

			display.addPageEmbed((embed) => {
				const releaseDate = new Date(game.releaseDateDisplay).getTime();
				return embed
					.setTitle(game.title)
					.setURL(`https://nintendo.com${game.url}`)
					.setThumbnail(game.boxart ?? game.horizontalHeaderImage ?? '')
					.setDescription(description)
					.addField(titles.price, price, true)
					.addField(titles.availability, game.availability[0], true)
					.addField(
						titles.releaseDate,
						releaseDate ? t(LanguageKeys.Globals.DateValue, { value: releaseDate }) : game.releaseDateDisplay,
						true
					)
					.addField(titles.numberOfPlayers, toTitleCase(game.numOfPlayers), true)
					.addField(titles.platform, game.platform, true)
					.addField(titles.nsuid, game.nsuid || 'TBD', true)
					.addField(titles.esrb, esrbText)
					.addField(titles.genres, game.genres.join(', ') || titles.noGenres);
			});
		}

		return display;
	}
}

interface EShopHit {
	availability: string[];
	boxart?: string;
	description: string;
	developers: string[];
	esrbDescriptors: string[];
	esrbRating: string;
	featured: boolean;
	franchises: string;
	freeToStart: boolean;
	generalFilters: string[];
	genres: string[];
	horizontalHeaderImage?: string;
	howToShop: string[];
	lastModified: number;
	lowestPrice: number;
	msrp: number;
	nsuid: string;
	numOfPlayers: string;
	objectID: string;
	platform: string;
	playerFilters: string[];
	priceRange: string;
	publishers: string[];
	releaseDateDisplay: string;
	salePrice: number | null;
	slug: string;
	title: string;
	url: string;
}

interface EshopResult {
	hits: EShopHit[];
	nbHits: number;
	page: number;
	nbPages: number;
	hitsPerPage: number;
	exhaustiveNbHits: true;
	query: string;
	params: string;
	processingTimeMS: number;
}
