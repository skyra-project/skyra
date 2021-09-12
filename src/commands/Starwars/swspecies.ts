import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import { fetchStarWarsApi, getSpecies } from '#utils/APIs/StarWars';
import { CdnUrls } from '#utils/constants';
import { formatNumber } from '#utils/functions';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['star-wars-species'],
	description: LanguageKeys.Commands.StarWars.SpeciesDescription,
	detailedDescription: LanguageKeys.Commands.StarWars.SpeciesExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const { t } = args;
		const loadingMessage = await sendLoadingMessage(message, t);
		const species = await args.rest('string');

		const results = await this.fetchAPI(species);

		if (results.length === 0) {
			this.error(LanguageKeys.Commands.StarWars.SpeciesQueryFail, { species });
		}

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.container.db.fetchColor(message))
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		const speciesTitles = t(LanguageKeys.Commands.StarWars.SpeciesEmbedTitles);

		for (const result of results) {
			display
				.addPageEmbed((embed) => {
					const description = [];

					if (result.language) {
						description.push(`**${speciesTitles.language}**: ${result.language}`);
					}

					if (result.averageHeight) {
						description.push(`**${speciesTitles.averageHeight}**: ${formatNumber(t, result.averageHeight)}`);
					}

					if (result.averageLifespan) {
						description.push(`**${speciesTitles.averageLifespan}**: ${formatNumber(t, result.averageLifespan)}`);
					}

					if (result.classification) {
						description.push(`**${speciesTitles.classification}**: ${result.classification}`);
					}

					description.push(`**${speciesTitles.designation}**: ${result.designation}`);

					if (result.eyeColors?.length) {
						description.push(
							`**${speciesTitles.eyeColours}**: ${t(LanguageKeys.Globals.AndListValue, { value: result.eyeColors.map(toTitleCase) })}`
						);
					}

					if (result.hairColors?.length) {
						description.push(
							`**${speciesTitles.hairColours}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.hairColors.map(toTitleCase)
							})}`
						);
					}

					if (result.skinColors?.length) {
						description.push(
							`**${speciesTitles.skinColours}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.skinColors.map(toTitleCase)
							})}`
						);
					}

					if (result.homeworld) {
						description.push(`**${speciesTitles.homeworld}**: ${result.homeworld.name}`);
					}

					return embed
						.setTitle(result.name) //
						.setDescription(description.join('\n'));
				})
				.addPageEmbed((embed) => {
					const description = [];

					if (result.films?.length) {
						description.push(
							'',
							`**${speciesTitles.appearedInFilms}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.films.map((film) => `\`${film.title}\``)
							})}`
						);
					}

					if (result.people.length) {
						description.push(
							`**${speciesTitles.knownPeopleOfSpecies}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.people.map((vehicle) => `\`${vehicle.name}\``)
							})}`
						);
					}

					return embed
						.setTitle(result.name) //
						.setDescription(description.join('\n\n'));
				});
		}

		await display.run(loadingMessage, message.author);
		return loadingMessage;
	}

	private async fetchAPI(species: string) {
		try {
			const {
				data: { getFuzzySpecies }
			} = await fetchStarWarsApi<'getFuzzySpecies'>(getSpecies, { species, take: 10 });

			return getFuzzySpecies;
		} catch {
			this.error(LanguageKeys.Commands.StarWars.SpeciesQueryFail, { species });
		}
	}
}
