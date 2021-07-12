import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { fetchStarWarsApi, getFilms } from '#utils/APIs/StarWars';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { cutText } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['star-wars-film', 'star-wars-movie'],
	cooldown: 10,
	description: LanguageKeys.Commands.StarWars.FilmDescription,
	extendedHelp: LanguageKeys.Commands.StarWars.FilmExtended
})
export class UserPaginateCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const [film, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, t)]);

		const results = await this.fetchAPI(film.toLowerCase());

		if (results.length === 0) {
			this.error(LanguageKeys.Commands.StarWars.FilmQueryFail, { film });
		}

		const display = new UserPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.context.db.fetchColor(message))
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		const filmTitles = t(LanguageKeys.Commands.StarWars.FilmEmbedTitles);

		for (const result of results) {
			display
				.addPageEmbed((embed) => {
					const description = [
						`**${filmTitles.episodeId}**: ${result.episodeId}`, //
						`**${filmTitles.releaseDate}**: ${t(LanguageKeys.Globals.DateValue, { value: new Date(result.releaseDate) })}`, //
						`**${filmTitles.director}**: ${result.director}`, //
						`**${filmTitles.producers}**: ${t(LanguageKeys.Globals.AndListValue, { value: result.producers })}` //
					].join('\n');

					return embed
						.setTitle(result.title) //
						.setDescription(description);
				})
				.addPageEmbed((embed) =>
					embed
						.setTitle(result.title) //
						.setDescription(cutText(result.openingCrawl, 4096))
				)
				.addPageEmbed((embed) => {
					const description: string[] = [];

					if (result.characters.length) {
						description.push(
							`**${filmTitles.characters}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.characters.map((character) => `\`${character.name}\``)
							})}`
						);
					}

					if (result.planets.length) {
						description.push(
							`**${filmTitles.planets}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.planets.map((planet) => `\`${planet.name}\``)
							})}`
						);
					}

					if (result.species.length) {
						description.push(
							`**${filmTitles.species}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.species.map((species) => `\`${species.name}\``)
							})}`
						);
					}

					if (result.starships.length) {
						description.push(
							`**${filmTitles.starships}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.starships.map((starship) => `\`${starship.name}\``)
							})}`
						);
					}

					if (result.vehicles.length) {
						description.push(
							`**${filmTitles.vehicles}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.vehicles.map((vehicle) => `\`${vehicle.name}\``)
							})}`
						);
					}

					return embed
						.setTitle(result.title) //
						.setDescription(description.join('\n\n'));
				});
		}

		await display.start(loadingMessage as GuildMessage, message.author);
		return loadingMessage;
	}

	private async fetchAPI(film: string) {
		try {
			const {
				data: { getFuzzyFilm }
			} = await fetchStarWarsApi<'getFuzzyFilm'>(getFilms, { film, take: 10 });
			return getFuzzyFilm;
		} catch {
			this.error(LanguageKeys.Commands.StarWars.FilmQueryFail, { film });
		}
	}
}
