import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { Tmdb } from '#lib/types/definitions/Tmdb';
import { TOKENS } from '#root/config';
import { BrandingColors } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { cutText } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['show', 'tvdb', 'tv'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.ShowsDescription,
	extendedHelp: LanguageKeys.Commands.Tools.ShowsExtended
})
export default class extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const show = await args.pick('string');
		const year = args.finished ? await args.pick('string') : null;

		const { t } = args;
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { results: entries } = await this.fetchAPI(t, show, year);
		if (!entries.length) throw t(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, t, entries);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async fetchAPI(t: TFunction, show: string, year: string | null) {
		try {
			const url = new URL('https://api.themoviedb.org/3/search/tv');
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);
			url.searchParams.append('query', show);

			if (year !== null) url.searchParams.append('first_air_date_year', year);
			return await fetch<Tmdb.TmdbSeriesList>(url, FetchResultTypes.JSON);
		} catch {
			throw t(LanguageKeys.System.QueryFail);
		}
	}

	private async fetchShowData(t: TFunction, serieId: number) {
		try {
			const url = new URL(`https://api.themoviedb.org/3/tv/${serieId}`);
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);

			return await fetch<Tmdb.TmdbSerie>(url, FetchResultTypes.JSON);
		} catch {
			throw t(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, shows: Tmdb.TmdbSeriesList['results']) {
		const titles = t(LanguageKeys.Commands.Tools.ShowsTitles);
		const fieldsData = t(LanguageKeys.Commands.Tools.ShowsData);
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await DbSet.fetchColor(message)) });

		const showData = await Promise.all(shows.map((show) => this.fetchShowData(t, show.id)));

		for (const show of showData) {
			display.addPageEmbed((embed) =>
				embed
					.setTitle(show.name)
					.setURL(`https://www.themoviedb.org/tv/${show.id}`)
					.setImage(`https://image.tmdb.org/t/p/original${show.backdrop_path}`)
					.setThumbnail(`https://image.tmdb.org/t/p/original${show.poster_path}`)
					.setDescription(cutText(show.overview, 750))
					.addField(
						titles.episodeRuntime,
						show.episode_run_time.length
							? `${t(LanguageKeys.Globals.DurationValue, { value: show.episode_run_time[0] * 60 * 1000 })}`
							: fieldsData.variableRuntime,
						true
					)
					.addField(titles.userScore, show.vote_average ? show.vote_average : fieldsData.unknownUserScore, true)
					.addField(titles.status, show.status, true)
					.addField(titles.firstAirDate, t(LanguageKeys.Globals.DateValue, { value: new Date(show.first_air_date).getTime() }), true)
					.addField(titles.genres, show.genres.length ? show.genres.map((genre) => genre.name).join(', ') : fieldsData.noGenres)
			);
		}

		return display;
	}
}
