import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { fetchStarWarsApi, getPerson } from '#utils/APIs/StarWars';
import { Emojis } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['star-wars-person', 'star-wars-character'],
	cooldown: 10,
	description: LanguageKeys.Commands.StarWars.PeopleDescription,
	extendedHelp: LanguageKeys.Commands.StarWars.PeopleExtended
})
export class UserPaginateCommand extends PaginatedMessageCommand {
	public async run(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const [film, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, t)]);

		const results = await this.fetchAPI(film.toLowerCase());

		if (results.length === 0) {
			this.error(LanguageKeys.Commands.StarWars.PeopleQueryFail, { film });
		}

		const display = new UserPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.context.db.fetchColor(message))
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		const peopleTitles = t(LanguageKeys.Commands.StarWars.PeopleEmbedTitles);

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

		await display.start(loadingMessage as GuildMessage, message.author);
		return loadingMessage;
	}

	private async fetchAPI(person: string) {
		try {
			const {
				data: { getFuzzyPerson }
			} = await fetchStarWarsApi<'getFuzzyPerson'>(getPerson, { person, take: 10 });

			return getFuzzyPerson;
		} catch {
			this.error(LanguageKeys.Commands.StarWars.PeopleQueryFail, { person });
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
