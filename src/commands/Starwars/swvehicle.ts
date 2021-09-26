import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import { fetchStarWarsApi, getVehicles } from '#utils/APIs/StarWars';
import { seconds } from '#utils/common';
import { CdnUrls } from '#utils/constants';
import { formatNumber } from '#utils/functions';
import { sendLoadingMessage } from '#utils/util';
import { time, TimestampStyles } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['star-wars-vehicle', 'swvehicles', 'star-wars-vehicles'],
	description: LanguageKeys.Commands.StarWars.VehicleDescription,
	detailedDescription: LanguageKeys.Commands.StarWars.VehicleExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const { t } = args;
		const loadingMessage = await sendLoadingMessage(message, t);
		const vehicle = await args.rest('string');

		const results = await this.fetchAPI(vehicle);

		if (results.length === 0) {
			this.error(LanguageKeys.Commands.StarWars.VehicleQueryFail, { vehicle });
		}

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.container.db.fetchColor(message))
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		const vehicleTitles = t(LanguageKeys.Commands.StarWars.VehicleEmbedTitles);

		for (const result of results) {
			display
				.addPageEmbed((embed) => {
					const description = [];

					if (result.model) {
						description.push(`**${vehicleTitles.model}**: ${result.model}`);
					}

					if (result.vehicleClass) {
						description.push(`**${vehicleTitles.vehicleClass}**: ${result.vehicleClass}`);
					}

					if (result.crew) {
						description.push(`**${vehicleTitles.crew}**: ${formatNumber(t, result.crew)}`);
					}

					if (result.passengers) {
						description.push(`**${vehicleTitles.amountOfPassengers}**: ${formatNumber(t, result.passengers)}`);
					}

					if (result.length) {
						description.push(`**${vehicleTitles.length}**: ${formatNumber(t, result.length)}`);
					}

					if (result.costInCredits) {
						description.push(`**${vehicleTitles.costInCredits}**: ${formatNumber(t, result.costInCredits)}`);
					}

					if (result.cargoCapacity) {
						description.push(`**${vehicleTitles.cargoCapacity}**: ${formatNumber(t, result.cargoCapacity)}`);
					}

					if (result.consumables) {
						description.push(
							`**${vehicleTitles.consumables}**: ${time(
								seconds.fromMilliseconds(Date.now() + result.consumables),
								TimestampStyles.RelativeTime
							)}`
						);
					}

					if (result.maxAtmospheringSpeed) {
						description.push(`**${vehicleTitles.maximumAtmospheringSpeed}**: ${formatNumber(t, result.maxAtmospheringSpeed)}`);
					}

					if (result.manufacturers?.length) {
						description.push(
							`**${vehicleTitles.manufacturers}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.manufacturers.map(toTitleCase)
							})}`
						);
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
							`**${vehicleTitles.appearedInFilms}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.films.map((film) => `\`${film.title}\``)
							})}`
						);
					}

					if (result.pilots.length) {
						description.push(
							`**${vehicleTitles.pilots}**: ${t(LanguageKeys.Globals.AndListValue, {
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

	private async fetchAPI(vehicle: string) {
		try {
			const {
				data: { getFuzzyVehicle }
			} = await fetchStarWarsApi<'getFuzzyVehicle'>(getVehicles, { vehicle, take: 10 });

			return getFuzzyVehicle;
		} catch {
			this.error(LanguageKeys.Commands.StarWars.VehicleQueryFail, { vehicle });
		}
	}
}
