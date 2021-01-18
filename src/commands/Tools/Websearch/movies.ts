import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RichDisplayCommand } from '#lib/structures/commands/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import type { GuildMessage } from '#lib/types';
import type { Tmdb } from '#lib/types/definitions/Tmdb';
import { TOKENS } from '#root/config';
import { BrandingColors } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { cutText } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<RichDisplayCommand.Options>({
	aliases: ['movie', 'tmdb'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.MoviesDescription,
	extendedHelp: LanguageKeys.Commands.Tools.MoviesExtended,
	usage: '<movie:str> [year:str]',
	usageDelim: 'y:'
})
export default class extends RichDisplayCommand {
	public async run(message: GuildMessage, [movie, year]: [string, string?]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { results: entries } = await this.fetchAPI(t, movie, year);
		if (!entries.length) throw t(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, t, entries);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(t: TFunction, movie: string, year?: string) {
		try {
			const url = new URL('https://api.themoviedb.org/3/search/movie');
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);
			url.searchParams.append('query', movie);

			if (year) url.searchParams.append('year', year);

			return await fetch<Tmdb.TmdbMovieList>(url, FetchResultTypes.JSON);
		} catch {
			throw t(LanguageKeys.System.QueryFail);
		}
	}

	private async fetchMovieData(t: TFunction, movieId: number) {
		try {
			const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);

			return await fetch<Tmdb.TmdbMovie>(url, FetchResultTypes.JSON);
		} catch {
			throw t(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, t: TFunction, movies: Tmdb.TmdbMovieList['results']) {
		const titles = t(LanguageKeys.Commands.Tools.MoviesTitles);
		const fieldsData = t(LanguageKeys.Commands.Tools.MoviesData);
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		const movieData = await Promise.all(movies.map((movie) => this.fetchMovieData(t, movie.id)));

		for (const movie of movieData) {
			display.addPage((embed: MessageEmbed) =>
				embed
					.setTitle(movie.title)
					.setURL(`https://www.themoviedb.org/movie/${movie.id}`)
					.setImage(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
					.setThumbnail(`https://image.tmdb.org/t/p/original${movie.poster_path}`)
					.setDescription(cutText(movie.overview, 750))
					.addField(
						titles.runtime,
						movie.runtime ? t(LanguageKeys.Globals.DurationValue, { value: movie.runtime * 60 * 1000 }) : fieldsData.movieInProduction,
						true
					)
					.addField(titles.userScore, movie.vote_average ? movie.vote_average : fieldsData.movieInProduction, true)
					.addField(titles.status, movie.status, true)
					.addField(
						titles.releaseDate,
						movie.release_date
							? t(LanguageKeys.Globals.DateValue, { value: new Date(movie.release_date).getTime() })
							: t(LanguageKeys.Globals.Unknown),
						true
					)
					.addField(
						titles.imdbPage,
						movie.imdb_id ? `[${fieldsData.linkClickHere}](http://www.imdb.com/title/${movie.imdb_id})` : fieldsData.none,
						true
					)
					.addField(titles.homePage, movie.homepage ? `[${fieldsData.linkClickHere}](${movie.homepage})` : fieldsData.none, true)
					.addField(titles.collection, movie.belongs_to_collection ? movie.belongs_to_collection.name : fieldsData.notPartOfCollection)
					.addField(titles.genres, movie.genres.length ? movie.genres.map((genre) => genre.name).join(', ') : fieldsData.noGenres)
			);
		}

		return display;
	}
}
