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
	aliases: ['show', 'tvdb', 'tv'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.ShowsDescription,
	extendedHelp: LanguageKeys.Commands.Tools.ShowsExtended,
	usage: '<show:str> [year:str]',
	usageDelim: 'y:'
})
export default class extends RichDisplayCommand {
	private releaseDateTimestamp = new Timestamp('MMMM d YYYY');

	public async run(message: GuildMessage, [show, year]: [string, string?]) {
		const t = await message.fetchT();
		const response = await message.send(
			new MessageEmbed().setDescription(pickRandom(t(LanguageKeys.System.Loading, { returnObjects: true }))).setColor(BrandingColors.Secondary)
		);

		const { results: entries } = await this.fetchAPI(t, show, year);
		if (!entries.length) throw t(LanguageKeys.System.NoResults);

		const display = await this.buildDisplay(message, t, entries);
		await display.start(response, message.author.id);
		return response;
	}

	private async fetchAPI(t: TFunction, show: string, year?: string) {
		try {
			const url = new URL('https://api.themoviedb.org/3/search/tv');
			url.searchParams.append('api_key', TOKENS.THEMOVIEDATABASE_KEY);
			url.searchParams.append('query', show);

			if (year) url.searchParams.append('first_air_date_year', year);

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
		const titles = t(LanguageKeys.Commands.Tools.ShowsTitles, { returnObjects: true });
		const fieldsData = t(LanguageKeys.Commands.Tools.ShowsData, { returnObjects: true });
		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));

		const showData = await Promise.all(shows.map((show) => this.fetchShowData(t, show.id)));

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
						show.episode_run_time.length
							? `${t(LanguageKeys.Globals.DurationValue, { value: show.episode_run_time[0] * 60 * 1000 })}`
							: fieldsData.variableRuntime,
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
