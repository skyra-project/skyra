import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { Tmdb } from '#lib/types/definitions/Tmdb';
import { fetch, FetchResultTypes, sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { cutText } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<PaginatedMessageCommand.Options>({
	enabled: envIsDefined('THEMOVIEDATABASE_TOKEN'),
	aliases: ['show', 'tvdb', 'tv'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.ShowsDescription,
	extendedHelp: LanguageKeys.Commands.Tools.ShowsExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const [show, year = null] = (await args.pick('string')).split('y:');

		const response = await sendLoadingMessage(message, args.t);
		const { results: entries } = await this.fetchAPI(show.trim(), year);
		if (!entries.length) this.error(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, args.t, entries);
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async fetchAPI(show: string, year: string | null) {
		try {
			const url = new URL('https://api.themoviedb.org/3/search/tv');
			url.searchParams.append('api_key', process.env.THEMOVIEDATABASE_TOKEN);
			url.searchParams.append('query', show);

			if (year !== null) url.searchParams.append('first_air_date_year', year.toString());
			return await fetch<Tmdb.TmdbSeriesList>(url, FetchResultTypes.JSON);
		} catch {
			this.error(LanguageKeys.System.QueryFail);
		}
	}

	private async fetchShowData(serieId: number) {
		try {
			const url = new URL(`https://api.themoviedb.org/3/tv/${serieId}`);
			url.searchParams.append('api_key', process.env.THEMOVIEDATABASE_TOKEN);

			return await fetch<Tmdb.TmdbSerie>(url, FetchResultTypes.JSON);
		} catch {
			this.error(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, shows: Tmdb.TmdbSeriesList['results']) {
		const titles = t(LanguageKeys.Commands.Tools.ShowsTitles);
		const fieldsData = t(LanguageKeys.Commands.Tools.ShowsData);
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await this.context.db.fetchColor(message)) });

		const showData = await Promise.all(shows.map((show) => this.fetchShowData(show.id)));

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
