import { DbSet } from '@lib/database';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { GuildMessage } from '@lib/types';
import { Tmdb } from '@lib/types/definitions/Tmdb';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TOKENS } from '@root/config';
import { cutText } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { Language, Timestamp } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['movie', 'tmdb'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Tools.MoviesDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.MoviesExtended),
	usage: '<movie:str> [year:str]',
	usageDelim: 'y:'
})
export default class extends RichDisplayCommand {
	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public async run(message: GuildMessage, [movie, year]: [string, string?]) {
		const language = await message.fetchLanguage();
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { results: entries } = await this.fetchAPI(language, movie, year);
		if (!entries.length) throw await message.fetchLocale(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, language, entries);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(language: Language, movie: string, year?: string) {
		try {
			const url = new URL('https://api.themoviedb.org/3/search/movie');
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);
			url.searchParams.append('query', movie);

			if (year) url.searchParams.append('year', year);

			return await fetch<Tmdb.TmdbMovieList>(url, FetchResultTypes.JSON);
		} catch {
			throw language.get(LanguageKeys.System.QueryFail);
		}
	}

	private async fetchMovieData(language: Language, movieId: number) {
		try {
			const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);

			return await fetch<Tmdb.TmdbMovie>(url, FetchResultTypes.JSON);
		} catch {
			throw language.get(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, language: Language, movies: Tmdb.TmdbMovieList['results']) {
		const titles = language.get(LanguageKeys.Commands.Tools.MoviesTitles);
		const fieldsData = language.get(LanguageKeys.Commands.Tools.MoviesData);
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		const movieData = await Promise.all(movies.map((movie) => this.fetchMovieData(language, movie.id)));

		for (const movie of movieData) {
			display.addPage((embed: MessageEmbed) =>
				embed
					.setTitle(movie.title)
					.setURL(`https://www.themoviedb.org/movie/${movie.id}`)
					.setImage(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
					.setThumbnail(`https://image.tmdb.org/t/p/original${movie.poster_path}`)
					.setDescription(cutText(movie.overview, 750))
					.addField(titles.runtime, movie.runtime ? language.duration(movie.runtime * 60 * 1000) : fieldsData.movieInProduction, true)
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
