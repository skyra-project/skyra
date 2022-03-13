import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import { fetchStarWarsApi, getPlanet } from '#utils/APIs/StarWars';
import { CdnUrls } from '#utils/constants';
import { formatNumber } from '#utils/functions';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['star-wars-planet'],
	description: LanguageKeys.Commands.StarWars.PlanetDescription,
	detailedDescription: LanguageKeys.Commands.StarWars.PlanetExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async messageRun(message: Message, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const loadingMessage = await sendLoadingMessage(message, t);
		const planet = await args.rest('string');

		const results = await this.fetchAPI(planet);

		if (results.length === 0) {
			this.error(LanguageKeys.Commands.StarWars.PlanetQueryFail, { planet });
		}

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.container.db.fetchColor(message))
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		const planetTitles = t(LanguageKeys.Commands.StarWars.PlanetEmbedTitles);

		for (const result of results) {
			display.addPageEmbed((embed) => {
				const description = [];

				if (result.diameter) {
					description.push(`**${planetTitles.diameter}**: ${formatNumber(t, result.diameter)}`);
				}

				if (result.population) {
					description.push(
						`**${planetTitles.averageSentientPopulation}**: ${t(LanguageKeys.Globals.NumberCompactValue, {
							value: result.population
						})}`
					);
				}

				if (result.climates) {
					description.push(
						`**${planetTitles.climates}**: ${t(LanguageKeys.Globals.AndListValue, {
							value: result.climates.map((climate) => toTitleCase(climate))
						})}`
					);
				}

				if (result.terrains) {
					description.push(
						`**${planetTitles.terrains}**: ${t(LanguageKeys.Globals.AndListValue, {
							value: result.terrains.map((terrain) => toTitleCase(terrain))
						})}`
					);
				}

				if (result.surfaceWater) {
					description.push(`**${planetTitles.surfaceWaterPercentage}**: ${result.surfaceWater}%`);
				}

				if (result.orbitalPeriod) {
					description.push(`**${planetTitles.orbitalPeriod}**: ${result.orbitalPeriod}`);
				}

				if (result.rotationPeriod) {
					description.push(`**${planetTitles.rotationPeriod}**: ${result.rotationPeriod}`);
				}

				if (result.films?.length) {
					description.push(
						'',
						`**${planetTitles.appearedInFilms}**: ${t(LanguageKeys.Globals.AndListValue, {
							value: result.films.map((film) => `\`${film.title}\``)
						})}`
					);
				}

				return embed
					.setTitle(result.name) //
					.setDescription(description.join('\n'));
			});
		}

		await display.run(loadingMessage, message.author);
		return loadingMessage;
	}

	private async fetchAPI(planet: string) {
		try {
			const {
				data: { getFuzzyPlanet }
			} = await fetchStarWarsApi<'getFuzzyPlanet'>(getPlanet, { planet, take: 10 });

			return getFuzzyPlanet;
		} catch {
			this.error(LanguageKeys.Commands.StarWars.PlanetQueryFail, { planet });
		}
	}
}
