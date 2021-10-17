import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { fetchStarWarsApi, getFilms } from '#utils/APIs/StarWars';
import { CdnUrls } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import { time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { cutText } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['star-wars-film', 'star-wars-movie'],
	description: LanguageKeys.Commands.StarWars.FilmDescription,
	detailedDescription: LanguageKeys.Commands.StarWars.FilmExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async messageRun(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const loadingMessage = await sendLoadingMessage(message, t);
		const film = await args.rest('string');

		const results = await this.fetchAPI(film.toLowerCase());

		if (results.length === 0) {
			this.error(LanguageKeys.Commands.StarWars.FilmQueryFail, { film });
		}

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.container.db.fetchColor(message))
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		const filmTitles = t(LanguageKeys.Commands.StarWars.FilmEmbedTitles);

		for (const result of results) {
			display
				.addPageEmbed((embed) => {
					const description = [
						`**${filmTitles.episodeId}**: ${result.episodeId}`,
						`**${filmTitles.releaseDate}**: ${time(new Date(result.releaseDate), TimestampStyles.ShortDate)}`,
						`**${filmTitles.director}**: ${result.director}`,
						`**${filmTitles.producers}**: ${t(LanguageKeys.Globals.AndListValue, { value: result.producers })}`
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

		await display.run(loadingMessage, message.author);
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
