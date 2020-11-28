import { DbSet } from '#lib/database/index';
import { RichDisplayCommand, RichDisplayCommandOptions } from '#lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { Tmdb } from '#lib/types/definitions/Tmdb';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { TOKENS } from '#root/config';
import { BrandingColors } from '#utils/constants';
import { fetch, FetchResultTypes, pickRandom } from '#utils/util';
import { cutText } from '@sapphire/utilities';
import { Timestamp } from '@sapphire/time-utilities';
import { ApplyOptions } from '@skyra/decorators';
import { MessageEmbed } from 'discord.js';
import { Language } from 'klasa';

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['show', 'tvdb', 'tv'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Tools.ShowsDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.ShowsExtended),
	usage: '<show:str> [year:str]',
	usageDelim: 'y:'
})
export default class extends RichDisplayCommand {
	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public async run(message: GuildMessage, [show, year]: [string, string?]) {
		const language = await message.fetchLanguage();
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(pickRandom(language.get(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const { results: entries } = await this.fetchAPI(language, show, year);
		if (!entries.length) throw language.get(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, language, entries);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(language: Language, show: string, year?: string) {
		try {
			const url = new URL('https://api.themoviedb.org/3/search/tv');
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);
			url.searchParams.append('query', show);

			if (year) url.searchParams.append('first_air_date_year', year);

			return await fetch<Tmdb.TmdbSeriesList>(url, FetchResultTypes.JSON);
		} catch {
			throw language.get(LanguageKeys.System.QueryFail);
		}
	}

	private async fetchShowData(language: Language, serieId: number) {
		try {
			const url = new URL(`https://api.themoviedb.org/3/tv/${serieId}`);
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);

			return await fetch<Tmdb.TmdbSerie>(url, FetchResultTypes.JSON);
		} catch {
			throw language.get(LanguageKeys.System.QueryFail);
		}
	}

	private async buildDisplay(message: GuildMessage, language: Language, shows: Tmdb.TmdbSeriesList['results']) {
		const titles = language.get(LanguageKeys.Commands.Tools.ShowsTitles);
		const fieldsData = language.get(LanguageKeys.Commands.Tools.ShowsData);
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		const showData = await Promise.all(shows.map((show) => this.fetchShowData(language, show.id)));

		for (const show of showData) {
			display.addPage((embed: MessageEmbed) =>
				embed
					.setTitle(show.name)
					.setURL(`https://www.themoviedb.org/tv/${show.id}`)
					.setImage(`https://image.tmdb.org/t/p/original${show.backdrop_path}`)
					.setThumbnail(`https://image.tmdb.org/t/p/original${show.poster_path}`)
					.setDescription(cutText(show.overview, 750))
					.addField(
						titles.episodeRuntime,
						show.episode_run_time.length ? `${language.duration(show.episode_run_time[0] * 60 * 1000)}` : fieldsData.variableRuntime,
						true
					)
					.addField(titles.userScore, show.vote_average ? show.vote_average : fieldsData.unknownUserScore, true)
					.addField(titles.status, show.status, true)
					.addField(titles.firstAirDate, this.releaseDateTimestamp.displayUTC(show.first_air_date), true)
					.addField(titles.genres, show.genres.length ? show.genres.map((genre) => genre.name).join(', ') : fieldsData.noGenres)
			);
		}

		return display;
	}
}
