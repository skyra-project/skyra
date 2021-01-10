import { DbSet } from '#lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { GuildMessage } from '#lib/types';
import { Tmdb } from '#lib/types/definitions/Tmdb';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { TOKENS } from '#root/config';
import { BrandingColors } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { Timestamp } from '@sapphire/time-utilities';
import { cutText } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['movie', 'tmdb'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.MoviesDescription,
	extendedHelp: LanguageKeys.Commands.Tools.MoviesExtended,
	usage: '<movie:str> [year:str]',
	usageDelim: 'y:'
})
export default class extends RichDisplayCommand {
	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public async run(message: GuildMessage, [movie, year]: [string, string?]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading, { returnObjects: true }))).setColor(BrandingColors.Secondary)
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
		const titles = t(LanguageKeys.Commands.Tools.MoviesTitles, { returnObjects: true });
		const fieldsData = t(LanguageKeys.Commands.Tools.MoviesData, { returnObjects: true });
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
					// TODO: i18next formatters in ternaries?
					.addField(
						titles.runtime,
						movie.runtime ? t(LanguageKeys.Globals.DurationValue, { value: movie.runtime * 60 * 1000 }) : fieldsData.movieInProduction,
						true
					)
					.addField(titles.userScore, movie.vote_average ? movie.vote_average : fieldsData.movieInProduction, true)
					.addField(titles.status, movie.status, true)
					.addField(titles.releaseDate, this.releaseDateTimestamp.displayUTC(movie.release_date), true)
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
