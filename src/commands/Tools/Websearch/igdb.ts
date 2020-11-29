import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { TOKENS } from '#root/config';
import { BrandingColors, Mime } from '#utils/constants';
import { AgeRatingRatingEnum, Company, Game } from '#utils/External/IgdbTypes';
import { fetch, FetchMethods, FetchResultTypes, pickRandom } from '#utils/util';
import { cutText, isNumber, roundNumber } from '@sapphire/utilities';
import { Timestamp } from '@sapphire/time-utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { Language } from 'klasa';

const API_URL = 'https://api.igdb.com/v4/games';

function isArrayOfNumbers(array: unknown[]): array is number[] {
	return array.every((val) => isNumber(val));
}

function isIgdbCompany(company: unknown): company is Company {
	return (company as Company).id !== undefined;
}

@ApplyOptions<RichDisplayCommandOptions>({
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Tools.IgdbDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.IgdbExtended),
	usage: '<game:str>'
})
export default class extends RichDisplayCommand {
	private readonly releaseDateTimestamp = new Timestamp('MMMM d YYYY');
	private readonly urlRegex = /https?:/i;
	private readonly igdbRequestHeaders = {
		'Content-Type': Mime.Types.TextPlain,
		Accept: Mime.Types.ApplicationJson,
		'Client-ID': TOKENS.TWITCH_CLIENT_ID
	};

	private readonly commonQuery = [
		`fields ${[
			'name',
			'url',
			'summary',
			'rating',
			'involved_companies.developer',
			'involved_companies.company.name',
			'genres.name',
			'release_dates.date',
			'platforms.name',
			'cover.url',
			'age_ratings.rating',
			'age_ratings.category'
		].join(',')}`,
		'limit 10',
		'offset 0'
	].join('; ');

	public async run(message: GuildMessage, [game]: [string]) {
		const language = await message.fetchLanguage();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const entries = await this.fetchAPI(language, game);
		if (!entries.length) throw language.get(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, language, entries);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(language: Language, game: string) {
		try {
			return await fetch<Game[]>(
				API_URL,
				{
					method: FetchMethods.Post,
					headers: {
						...this.igdbRequestHeaders,
						Authorization: `Bearer ${await this.client.twitch.fetchBearer()}`
					},
					body: `search: "${game}"; ${this.commonQuery};`
				},
				FetchResultTypes.JSON
			);
		} catch {
			throw language.get(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, language: Language, entries: Game[]) {
		const titles = language.get(LanguageKeys.Commands.Tools.IgdbTitles);
		const fieldsData = language.get(LanguageKeys.Commands.Tools.IgdbData);
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		for (const game of entries) {
			const coverImg = this.resolveCover(game.cover);
			const userRating = game.rating ? `${roundNumber(game.rating, 2)}%` : fieldsData.noRating;

			display.addPage((embed: MessageEmbed) =>
				embed
					.setTitle(game.name)
					.setURL(game.url || '')
					.setThumbnail(coverImg)
					.setDescription(
						[
							this.resolveSummary(game.summary, fieldsData.noSummary),
							'',
							`**${titles.userScore}**: ${userRating}`,
							`**${titles.ageRating}**: ${this.resolveAgeRating(game.age_ratings, fieldsData.noAgeRatings)}`,
							`**${titles.releaseDate}**: ${this.resolveReleaseDate(game.release_dates, fieldsData.noReleaseDate)}`,
							`**${titles.genres}**: ${this.resolveGenres(game.genres, fieldsData.noGenres)}`,
							`**${titles.developers}**: ${this.resolveDevelopers(game.involved_companies, fieldsData.noDevelopers)}`,
							`**${titles.platform}**: ${this.resolvePlatforms(game.platforms, fieldsData.noPlatforms)}`
						].join('\n')
					)
			);
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
		return ageRatings.map((ageRating) => `${ageRating.category === 1 ? 'ESRB' : 'PEGI'}: ${AgeRatingRatingEnum[ageRating.rating ?? 0]}`);
	}

	private resolveGenres(genres: Game['genres'], fallback: string) {
		if (!genres || isArrayOfNumbers(genres)) return fallback;
		return genres.map((genre) => genre.name).join(', ');
	}

	private resolveDevelopers(developers: Game['involved_companies'], fallback: string) {
		if (!developers || isArrayOfNumbers(developers)) return fallback;
		return developers
			.map((involvedCompany) => {
				if (isIgdbCompany(involvedCompany.company)) {
					return involvedCompany.company.name;
				}

				return null;
			})
			.filter(Boolean)
			.join(', ');
	}

	private resolveReleaseDate(releaseDates: Game['release_dates'], fallback: string) {
		if (!releaseDates || releaseDates.length === 0 || isArrayOfNumbers(releaseDates) || !releaseDates[0].date) return fallback;
		return this.releaseDateTimestamp.displayUTC(releaseDates[0].date * 1000);
	}

	private resolvePlatforms(platforms: Game['platforms'], fallback: string) {
		if (!platforms || isArrayOfNumbers(platforms)) return fallback;
		return platforms.map((platform) => platform.name).join(', ');
	}
}
