import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import { CdnUrls } from '#lib/types/Constants';
import { fetchStarWarsApi, getVehicles } from '#utils/APIs/StarWars';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['star-wars-vehicle', 'swvehicles', 'star-wars-vehicles'],
	cooldown: 10,
	description: LanguageKeys.Commands.StarWars.VehicleDescription,
	extendedHelp: LanguageKeys.Commands.StarWars.VehicleExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const { t } = args;
		const [vehicle, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, t)]);

		const results = await this.fetchAPI(vehicle);

		if (results.length === 0) {
			this.error(LanguageKeys.Commands.StarWars.VehicleQueryFail, { vehicle });
		}

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.context.db.fetchColor(message))
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
						description.push(`**${vehicleTitles.crew}**: ${t(LanguageKeys.Globals.NumberValue, { value: result.crew })}`);
					}

					if (result.passengers) {
						description.push(
							`**${vehicleTitles.amountOfPassengers}**: ${t(LanguageKeys.Globals.NumberValue, {
								value: result.passengers
							})}`
						);
					}

					if (result.length) {
						description.push(`**${vehicleTitles.length}**: ${t(LanguageKeys.Globals.NumberValue, { value: result.length })}`);
					}

					if (result.costInCredits) {
						description.push(
							`**${vehicleTitles.costInCredits}**: ${t(LanguageKeys.Globals.NumberValue, { value: result.costInCredits })}`
						);
					}

					if (result.cargoCapacity) {
						description.push(
							`**${vehicleTitles.cargoCapacity}**: ${t(LanguageKeys.Globals.NumberValue, { value: result.cargoCapacity })}`
						);
					}

					if (result.consumables) {
						description.push(
							`**${vehicleTitles.consumables}**: ${t(LanguageKeys.Globals.DurationValue, { value: result.consumables, precision: 1 })}`
						);
					}

					if (result.maxAtmospheringSpeed) {
						description.push(
							`**${vehicleTitles.maximumAtmospheringSpeed}**: ${t(LanguageKeys.Globals.NumberValue, {
								value: result.maxAtmospheringSpeed
							})}`
						);
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
