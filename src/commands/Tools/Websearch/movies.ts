import { DbSet } from '@lib/structures/DbSet';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { Tmdb } from '@lib/types/definitions/Tmdb';
import { TOKENS } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { cutText, fetch, FetchResultTypes } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, Timestamp } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['movie', 'tmdb'],
	cooldown: 10,
	description: language => language.tget('COMMAND_MOVIES_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_MOVIES_EXTENDED'),
	usage: '<movie:str> [year:str]',
	usageDelim: 'y:'
})
export default class extends RichDisplayCommand {

	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public async run(message: KlasaMessage, [movie, year]: [string, string?]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const { results: entries } = await this.fetchAPI(message, movie, year);
		if (!entries.length) throw message.language.tget('SYSTEM_NO_RESULTS');

		const display = await this.buildDisplay(entries, message);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, movie: string, year?: string) {
		try {
			const url = new URL('https://api.themoviedb.org/3/search/movie');
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);
			url.searchParams.append('query', movie);

			if (year) url.searchParams.append('year', year);

			return await fetch<Tmdb.TmdbMovieList>(url, FetchResultTypes.JSON);
		} catch {
			throw message.language.tget('SYSTEM_QUERY_FAIL');
		}
	}

	private async fetchMovieData(message: KlasaMessage, movieId: number) {
		try {
			const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);

			return await fetch<Tmdb.TmdbMovie>(url, FetchResultTypes.JSON);
		} catch {
			throw message.language.tget('SYSTEM_QUERY_FAIL');
		}
	}

	private async buildDisplay(movies: Tmdb.TmdbMovieList['results'], message: KlasaMessage) {
		const titles = message.language.tget('COMMAND_MOVIES_TITLES');
		const fieldsData = message.language.tget('COMMAND_MOVIES_DATA');
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(await DbSet.fetchColor(message)));

		const movieData = await Promise.all(movies.map(movie => this.fetchMovieData(message, movie.id)));

		for (const movie of movieData) {
			display.addPage((embed: MessageEmbed) => embed
				.setTitle(movie.title)
				.setURL(`https://www.themoviedb.org/movie/${movie.id}`)
				.setImage(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
				.setThumbnail(`https://image.tmdb.org/t/p/original${movie.poster_path}`)
				.setDescription(cutText(movie.overview, 750))
				.addField(titles.RUNTIME, movie.runtime ? message.language.duration(movie.runtime * 60 * 1000) : fieldsData.MOVIE_IN_PRODUCTION, true)
				.addField(titles.USER_SCORE, movie.vote_average ? movie.vote_average : fieldsData.MOVIE_IN_PRODUCTION, true)
				.addField(titles.STATUS, movie.status, true)
				.addField(titles.RELEASE_DATE, this.releaseDateTimestamp.displayUTC(movie.release_date), true)
				.addField(titles.IMDB_PAGE, movie.imdb_id ? `[${fieldsData.LINK_CLICK_HERE}](http://www.imdb.com/title/${movie.imdb_id})` : fieldsData.NONE, true)
				.addField(titles.HOME_PAGE, movie.homepage ? `[${fieldsData.LINK_CLICK_HERE}](${movie.homepage})` : fieldsData.NONE, true)
				.addField(titles.COLLECTION, movie.belongs_to_collection ? movie.belongs_to_collection.name : fieldsData.NOT_PART_OF_COLLECTION)
				.addField(titles.GENRES, movie.genres.length ? movie.genres.map(genre => genre.name).join(', ') : fieldsData.NO_GENRES));
		}

		return display;
	}

}
