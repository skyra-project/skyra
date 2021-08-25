import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import { fetchStarWarsApi, getStarship } from '#utils/APIs/StarWars';
import { CdnUrls } from '#utils/constants';
import { formatNumber } from '#utils/functions';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['star-wars-space-ship', 'swship', 'star-wars-ship'],
	description: LanguageKeys.Commands.StarWars.StarshipDescription,
	extendedHelp: LanguageKeys.Commands.StarWars.StarshipExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const { t } = args;
		const loadingMessage = await sendLoadingMessage(message, t);
		const starship = await args.rest('string');

		const results = await this.fetchAPI(starship);

		if (results.length === 0) {
			this.error(LanguageKeys.Commands.StarWars.StarshipQueryFail, { starship });
		}

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.container.db.fetchColor(message))
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		const starshipTitles = t(LanguageKeys.Commands.StarWars.StarshipEmbedTitles);

		for (const result of results) {
			display
				.addPageEmbed((embed) => {
					const description = [];

					if (result.model) {
						description.push(`**${starshipTitles.model}**: ${result.model}`);
					}

					if (result.starshipClass) {
						description.push(`**${starshipTitles.starshipClass}**: ${result.starshipClass}`);
					}

					if (result.crew) {
						description.push(`**${starshipTitles.crew}**: ${formatNumber(t, result.crew)}`);
					}

					if (result.passengers) {
						description.push(`**${starshipTitles.amountOfPassengers}**: ${formatNumber(t, result.passengers)}`);
					}

					if (result.length) {
						description.push(`**${starshipTitles.length}**: ${formatNumber(t, result.length)}`);
					}

					if (result.costInCredits) {
						description.push(`**${starshipTitles.costInCredits}**: ${formatNumber(t, result.costInCredits)}`);
					}

					if (result.cargoCapacity) {
						description.push(`**${starshipTitles.cargoCapacity}**: ${formatNumber(t, result.cargoCapacity)}`);
					}

					if (result.consumables) {
						description.push(
							`**${starshipTitles.consumables}**: ${t(LanguageKeys.Globals.DurationValue, { value: result.consumables, precision: 1 })}`
						);
					}

					if (result.maxAtmospheringSpeed) {
						description.push(`**${starshipTitles.maximumAtmospheringSpeed}**: ${formatNumber(t, result.maxAtmospheringSpeed)}`);
					}

					if (result.hyperdriveRating) {
						description.push(`**${starshipTitles.hyperdriveRating}**: ${formatNumber(t, result.hyperdriveRating)}`);
					}

					if (result.MGLT) {
						description.push(`**${starshipTitles.megalightsTravelSpeed}**: ${formatNumber(t, result.MGLT)}`);
					}

					if (result.manufacturers?.length) {
						`**${starshipTitles.manufacturers}**: ${t(LanguageKeys.Globals.AndListValue, {
							value: result.manufacturers.map(toTitleCase)
						})}`;
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
							`**${starshipTitles.appearedInFilms}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.films.map((film) => `\`${film.title}\``)
							})}`
						);
					}

					if (result.pilots.length) {
						description.push(
							`**${starshipTitles.pilots}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.pilots.map((vehicle) => `\`${vehicle.name}\``)
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

	private async fetchAPI(starship: string) {
		try {
			const {
				data: { getFuzzyStarship }
			} = await fetchStarWarsApi<'getFuzzyStarship'>(getStarship, { starship, take: 10 });

			return getFuzzyStarship;
		} catch {
			this.error(LanguageKeys.Commands.StarWars.StarshipQueryFail, { starship });
		}
	}
}
