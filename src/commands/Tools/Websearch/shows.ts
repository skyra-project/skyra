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
			aliases: ['show', 'tvdb', 'tv'],
			cooldown: 10,
			description: language => language.tget('COMMAND_SHOWS_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SHOWS_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<show:str> [year:str]',
			usageDelim: 'y:'
		});
	}

	public async run(message: KlasaMessage, [show, year]: [string, string?]) {
		const response = await message.sendEmbed(new MessageEmbed()
			.setDescription(message.language.tget('SYSTEM_LOADING'))
			.setColor(BrandingColors.Secondary));

		const { results: entries } = await this.fetchAPI(message, show, year);
		if (!entries.length) throw message.language.tget('SYSTEM_NO_RESULTS');

		const display = await this.buildDisplay(entries, message);
		await display.start(response, message.author.id);
		return response;
	}

	private fetchAPI(message: KlasaMessage, show: string, year?: string) {
		const url = new URL('https://api.themoviedb.org/3/search/tv');
		url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE);
		url.searchParams.append('query', show);

		if (year) url.searchParams.append('first_air_date_year', year);

		return fetch(url, 'json')
			.catch(() => { throw message.language.tget('SYSTEM_QUERY_FAIL'); }) as Promise<Tmdb.TmdbSeriesList>;
	}

	private fetchShowData(message: KlasaMessage, serieId: number) {
		const url = new URL(`https://api.themoviedb.org/3/tv/${serieId}`);
		url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE);

		return fetch(url, 'json')
			.catch(() => { throw message.language.tget('SYSTEM_QUERY_FAIL'); }) as Promise<Tmdb.TmdbSerie>;
	}

	private async buildDisplay(shows: Tmdb.TmdbSeriesList['results'], message: KlasaMessage) {
		const titles = message.language.tget('COMMAND_SHOWS_TITLES');
		const fieldsData = message.language.tget('COMMAND_SHOWS_DATA');
		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));

		const showData = await Promise.all(shows.map(show => this.fetchShowData(message, show.id)));

		for (const show of showData) {
			display.addPage((embed: MessageEmbed) => embed
				.setTitle(show.name)
				.setURL(`https://www.themoviedb.org/tv/${show.id}`)
				.setImage(`https://image.tmdb.org/t/p/original${show.backdrop_path}`)
				.setThumbnail(`https://image.tmdb.org/t/p/original${show.poster_path}`)
				.setDescription(cutText(show.overview, 750))
				.addField(
					titles.EPISODE_RUNTIME,
					show.episode_run_time.length
						? `${message.language.duration(show.episode_run_time[0] * 60 * 1000)}`
						: fieldsData.VARIABLE_RUNTIME,
					true
				)
				.addField(titles.USER_SCORE, show.vote_average ? show.vote_average : fieldsData.UNKNOWN_USER_SCORE, true)
				.addField(titles.STATUS, show.status, true)
				.addField(titles.FIRST_AIR_DATE, this.releaseDateTimestamp.displayUTC(show.first_air_date), true)
				.addField(titles.GENRES, show.genres.length ? show.genres.map(genre => genre.name).join(', ') : fieldsData.NO_GENRES));
		}

		return display;
	}

}
