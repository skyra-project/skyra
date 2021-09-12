import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { fetchStarWarsApi, getPerson } from '#utils/APIs/StarWars';
import { CdnUrls, Emojis } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['star-wars-person', 'star-wars-character'],
	description: LanguageKeys.Commands.StarWars.PersonDescription,
	detailedDescription: LanguageKeys.Commands.StarWars.PersonExtended
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const loadingMessage = await sendLoadingMessage(message, t);
		const person = await args.rest('string');

		const results = await this.fetchAPI(person);

		if (results.length === 0) {
			this.error(LanguageKeys.Commands.StarWars.PersonQueryFail, { person });
		}

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.container.db.fetchColor(message))
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		const peopleTitles = t(LanguageKeys.Commands.StarWars.PersonEmbedTitles);

		for (const result of results) {
			display
				.addPageEmbed((embed) => {
					const description = [];

					if (result.height) {
						description.push(`**${peopleTitles.height}**: ${result.height}`);
					}

					if (result.mass) {
						description.push(`**${peopleTitles.mass}**: ${result.mass}`);
					}

					if (result.gender) {
						description.push(`**${peopleTitles.gender}**: ${this.parseGenderString(result.gender)}`);
					}

					if (result.skinColors?.length) {
						description.push(
							`**${peopleTitles.skinColours}**: ${t(LanguageKeys.Globals.AndListValue, { value: result.skinColors.map(toTitleCase) })}`
						);
					}

					if (result.eyeColors?.length) {
						description.push(
							`**${peopleTitles.eyeColours}**: ${t(LanguageKeys.Globals.AndListValue, { value: result.eyeColors.map(toTitleCase) })}`
						);
					}

					if (result.birthYear) {
						description.push(`**${peopleTitles.yearOfBirth}**: ${result.birthYear}`);
					}

					if (result.hairColors?.length) {
						description.push(
							`**${peopleTitles.hairColours}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.hairColors.map(toTitleCase)
							})}`
						);
					}

					if (result.homeworld) {
						description.push(`**${peopleTitles.homeworld}**: ${result.homeworld.name}`);
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
							`**${peopleTitles.appearedInFilms}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.films.map((film) => `\`${film.title}\``)
							})}`
						);
					}

					if (result.species?.length) {
						description.push(
							`**${peopleTitles.species}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.species.map((species) => `\`${species.name}\``)
							})}`
						);
					}

					if (result.starships.length) {
						description.push(
							`**${peopleTitles.ownedStarShips}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.starships.map((starship) => `\`${starship.name}\``)
							})}`
						);
					}

					if (result.vehicles.length) {
						description.push(
							`**${peopleTitles.ownedVehicles}**: ${t(LanguageKeys.Globals.AndListValue, {
								value: result.vehicles.map((vehicle) => `\`${vehicle.name}\``)
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

	private async fetchAPI(person: string) {
		try {
			const {
				data: { getFuzzyPerson }
			} = await fetchStarWarsApi<'getFuzzyPerson'>(getPerson, { person, take: 10 });

			return getFuzzyPerson;
		} catch {
			this.error(LanguageKeys.Commands.StarWars.PersonQueryFail, { person });
		}
	}

	private parseGenderString(gender: 'male' | 'female' | string) {
		switch (gender.toLowerCase()) {
			case 'male':
				return Emojis.MaleSignEmoji;
			case 'female':
				return Emojis.FemaleSignEmoji;
			default:
				return toTitleCase(gender);
		}
	}
}
