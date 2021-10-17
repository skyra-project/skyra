import { envIsDefined } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import type { Tmdb } from '#lib/types/definitions/Tmdb';
import { minutes } from '#utils/common';
import { formatNumber } from '#utils/functions';
import { sendLoadingMessage } from '#utils/util';
import { time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { cutText } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';
import { URL } from 'url';

@ApplyOptions<PaginatedMessageCommand.Options>({
	enabled: envIsDefined('THEMOVIEDATABASE_TOKEN'),
	aliases: ['show', 'tvdb', 'tv'],
	description: LanguageKeys.Commands.Tools.ShowsDescription,
	detailedDescription: LanguageKeys.Commands.Tools.ShowsExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async messageRun(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const [show, year = null] = (await args.pick('string')).split('y:');

		const response = await sendLoadingMessage(message, args.t);
		const { results: entries } = await this.fetchAPI(show.trim(), year);
		if (!entries.length) this.error(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, args.t, entries);
		await display.run(response, message.author);
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
		const display = new SkyraPaginatedMessage({ template: new MessageEmbed().setColor(await this.container.db.fetchColor(message)) });

		const showData = await Promise.all(shows.map((show) => this.fetchShowData(show.id)));

		for (const show of showData) {
			display.addPageEmbed((embed) => {
				const episodeRuntime = show.episode_run_time.length
					? `${t(LanguageKeys.Globals.DurationValue, { value: minutes(show.episode_run_time[0]) })}`
					: fieldsData.variableRuntime;
				const userScore = typeof show.vote_average === 'number' ? formatNumber(t, show.vote_average) : fieldsData.unknownUserScore;

				return embed
					.setTitle(show.name)
					.setURL(`https://www.themoviedb.org/tv/${show.id}`)
					.setImage(`https://image.tmdb.org/t/p/original${show.backdrop_path}`)
					.setThumbnail(`https://image.tmdb.org/t/p/original${show.poster_path}`)
					.setDescription(cutText(show.overview, 750))
					.addField(titles.episodeRuntime, episodeRuntime, true)
					.addField(titles.userScore, userScore, true)
					.addField(titles.status, show.status, true)
					.addField(titles.firstAirDate, time(new Date(show.first_air_date), TimestampStyles.ShortDate), true)
					.addField(titles.genres, show.genres.length ? show.genres.map((genre) => genre.name).join(', ') : fieldsData.noGenres);
			});
		}

		return display;
	}
}
