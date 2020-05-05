import { isNumber } from '@klasa/utils';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { TOKENS } from '@root/config';
import { BrandingColors } from '@utils/constants';
import { AgeRatingRatingEnum, Company, Game } from '@utils/External/IgdbTypes';
import { cutText, fetch, FetchMethods, FetchResultTypes, getColor, roundNumber } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp } from 'klasa';

const API_URL = 'https://api-v3.igdb.com/games';

function isArrayOfNumbers(array: unknown[]): array is number[] {
	return array.every(val => isNumber(val));
}

function isIgdbCompany(company: unknown): company is Company {
	return (company as Company).id !== undefined;
}

export default class extends SkyraCommand {

	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');
	private urlRegex = /https?:/i;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_IGDB_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_IGDB_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<game:str>'
		});
	}

	public async run(message: KlasaMessage, [game]: [string]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const entries = await this.fetchAPI(message, game);
		if (!entries.length) throw message.language.tget('SYSTEM_NO_RESULTS');

		const display = this.buildDisplay(entries, message);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, game: string) {
		try {
			return await fetch<Game[]>(API_URL, {
				method: FetchMethods.Post,
				headers: {
					'user-key': TOKENS.INTERNETGAMEDATABASE_KEY
				},
				body: [
					`search: "${game}";`,
					'fields name, url, summary, rating, involved_companies.developer,',
					'involved_companies.company.name, genres.name, release_dates.date,',
					'platforms.name, cover.url, age_ratings.rating, age_ratings.category;',
					'where age_ratings != n;',
					'limit 10;',
					'offset 0;'
				].join('')
			}, FetchResultTypes.JSON);
		} catch {
			throw message.language.tget('SYSTEM_QUERY_FAIL');
		}
	}

	private buildDisplay(entries: Game[], message: KlasaMessage) {
		const titles = message.language.tget('COMMAND_IGDB_TITLES');
		const fieldsData = message.language.tget('COMMAND_IGDB_DATA');
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

		for (const game of entries) {
			const coverImg = this.resolveCover(game.cover);
			const userRating = game.rating ? `${roundNumber(game.rating, 2)}%` : fieldsData.NO_RATING;

			display.addPage((embed: MessageEmbed) => embed
				.setTitle(game.name)
				.setURL(game.url || '')
				.setThumbnail(coverImg)
				.setDescription(this.resolveSummary(game.summary, fieldsData.NO_SUMMARY))
				.addField(titles.USER_SCORE, userRating)
				.addField(titles.AGE_RATING, this.resolveAgeRating(game.age_ratings, fieldsData.NO_AGE_RATINGS))
				.addField(titles.RELEASE_DATE, this.resolveReleaseDate(game.release_dates, fieldsData.NO_RELEASE_DATE))
				.addField(titles.GENRES, this.resolveGenres(game.genres, fieldsData.NO_GENRES))
				.addField(titles.DEVELOPERS, this.resolveDevelopers(game.involved_companies, fieldsData.NO_DEVELOPERS))
				.addField(titles.PLATFORMS, this.resolvePlatforms(game.platforms, fieldsData.NO_PLATFORMS)));
		}

		return display;
	}

	private resolveCover(cover: Game['cover']) {
		if (!cover || isNumber(cover) || !cover.url) return '';

		return this.urlRegex.test(cover.url) ? cover.url : `https:${cover.url}`;
	}

	private resolveSummary(summary: Game['summary'], fallback: string) {
		if (!summary) return fallback;
		return cutText(summary, 750);
	}

	private resolveAgeRating(ageRatings: Game['age_ratings'], fallback: string) {
		if (!ageRatings || isArrayOfNumbers(ageRatings)) return fallback;
		return ageRatings.map(ageRating => `${ageRating.category === 1 ? 'ESRB' : 'PEGI'}: ${AgeRatingRatingEnum[ageRating.rating ?? 0]}`);
	}

	private resolveGenres(genres: Game['genres'], fallback: string) {
		if (!genres || isArrayOfNumbers(genres)) return fallback;
		return genres.map(genre => genre.name).join(', ');
	}

	private resolveDevelopers(developers: Game['involved_companies'], fallback: string) {
		if (!developers || isArrayOfNumbers(developers)) return fallback;
		return developers.map(involvedCompany => {
			if (isIgdbCompany(involvedCompany.company)) {
				return involvedCompany.company.name;
			}

			return null;
		}).filter(Boolean).join(', ');
	}

	private resolveReleaseDate(releaseDates: Game['release_dates'], fallback: string) {
		if (!releaseDates || releaseDates.length === 0 || isArrayOfNumbers(releaseDates) || !releaseDates[0].date) return fallback;
		return this.releaseDateTimestamp.displayUTC(releaseDates[0].date * 1000);
	}

	private resolvePlatforms(platforms: Game['platforms'], fallback: string) {
		if (!platforms || isArrayOfNumbers(platforms)) return fallback;
		return platforms.map(platform => platform.name).join(', ');
	}

}
