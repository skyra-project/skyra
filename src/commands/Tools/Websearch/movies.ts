import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { TOKENS } from '../../../../config';
import { Tmdb } from '../../../lib/types/definitions/Tmdb';
import { cutText, fetch, getColor } from '../../../lib/util/util';
import { BrandingColors } from '../../../lib/util/constants';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';

export default class extends SkyraCommand {

	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['movie', 'tmdb'],
			cooldown: 10,
			description: language => language.tget('COMMAND_MOVIES_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MOVIES_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<movie:str> [year:str]',
			usageDelim: 'y:'
		});
	}

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

	private fetchAPI(message: KlasaMessage, movie: string, year?: string) {
		const url = new URL('https://api.themoviedb.org/3/search/movie');
		url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE);
		url.searchParams.append('query', movie);

		if (year) url.searchParams.append('year', year);

		return fetch(url, 'json')
			.catch(() => { throw message.language.tget('SYSTEM_QUERY_FAIL'); }) as Promise<Tmdb.TmdbMovieList>;
	}

	private fetchMovieData(message: KlasaMessage, movieId: number) {
		const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
		url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE);

		return fetch(url, 'json')
			.catch(() => { throw message.language.tget('SYSTEM_QUERY_FAIL'); }) as Promise<Tmdb.TmdbMovie>;
	}

	private async buildDisplay(movies: Tmdb.TmdbMovieList['results'], message: KlasaMessage) {
		const titles = message.language.tget('COMMAND_MOVIES_TITLES');
		const fieldsData = message.language.tget('COMMAND_MOVIES_DATA');
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

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
