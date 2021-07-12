import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, UserLazyPaginatedMessage } from '#lib/structures';
// @ts-ignore This is incorrect but will be replaced eventually anyway
import { GuildMessage } from '#lib/types';
import { CdnUrls } from '#lib/types/Constants';
import { Emojis } from '#utils/constants';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { cutText, toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import { URL } from 'url';

const BaseUrl = 'https://swapi.dev/api';

@ApplyOptions<PaginatedMessageCommand.Options>({
	cooldown: 10,
	aliases: ['swapi', 'star-wars', 'sw'],
	description: LanguageKeys.Commands.Tools.StarWarsDescription,
	extendedHelp: LanguageKeys.Commands.Tools.StarWarsExtended,
	subCommands: [
		{ input: 'film', output: Resource.Films },
		Resource.Films,
		{ input: 'character', output: Resource.People },
		{ input: 'person', output: Resource.People },
		{ input: Resource.People, default: true },
		{ input: 'planet', output: Resource.Planets },
		Resource.Planets
	]
})
export class UserCommand extends PaginatedMessageCommand {
	public async [Resource.People](message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const [query, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, t)]);

		const peopleData = await this.fetchApi<Resource.People>({ resource: Resource.People, query });

		if (peopleData.count === 0) return this.error(LanguageKeys.Commands.Tools.StarWarsNoResult, { query });

		const { people: peopleTitles } = t(LanguageKeys.Commands.Tools.StarWarsEmbedTitles);
		const display = new UserLazyPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.context.db.fetchColor(message))
				.setFooter(Footer)
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		for (const result of peopleData.results) {
			display.addAsyncPageEmbed(async (embed) => {
				const personHomeworld = await this.fetchApi<Resource.Planets, StarWars.DetailOrSearch.Detail, false>({
					url: result.homeworld,
					throwOnError: false
				});
				const personSpecies: string[] = [];
				const personStarships: string[] = [];
				const personFilms: string[] = [];
				const personVehicles: string[] = [];

				for (const species of result.species) {
					const speciesData = await this.fetchApi<Resource.Species, StarWars.DetailOrSearch.Detail, false>({
						url: species,
						throwOnError: false
					});

					if (speciesData) {
						personSpecies.push(speciesData.name);
					}
				}

				for (const starship of result.starships) {
					const starshipData = await this.fetchApi<Resource.Starships, StarWars.DetailOrSearch.Detail, false>({
						url: starship,
						throwOnError: false
					});

					if (starshipData) {
						personStarships.push(starshipData.name);
					}
				}

				for (const vehicle of result.vehicles) {
					const vehicleData = await this.fetchApi<Resource.Vehicles, StarWars.DetailOrSearch.Detail, false>({
						url: vehicle,
						throwOnError: false
					});

					if (vehicleData) {
						personVehicles.push(vehicleData.name);
					}
				}

				for (const film of result.films) {
					const filmData = await this.fetchApi<Resource.Films, StarWars.DetailOrSearch.Detail, false>({
						url: film,
						throwOnError: false
					});

					if (filmData) {
						personFilms.push(filmData.title);
					}
				}

				const description = [
					`**${peopleTitles.height}**: ${result.height}`,
					`**${peopleTitles.mass}**: ${result.mass}`,
					`**${peopleTitles.gender}**: ${this.parseGenderString(result.gender)}`,
					`**${peopleTitles.skinColour}**: ${toTitleCase(result.skin_color)}`,
					`**${peopleTitles.eyeColour}**: ${toTitleCase(result.eye_color)}`,
					`**${peopleTitles.yearOfBirth}**: ${result.birth_year}`,
					`**${peopleTitles.hairColour}**: ${t(LanguageKeys.Globals.AndListValue, {
						value: result.hair_color.split(', ').map(toTitleCase)
					})}`,
					personHomeworld ? `**${peopleTitles.homeWorld}**: ${personHomeworld.name}` : undefined,
					personSpecies.length
						? `**${peopleTitles.species}**: ${t(LanguageKeys.Globals.AndListValue, { value: personSpecies })}`
						: undefined,
					personStarships.length
						? `**${peopleTitles.ownedStarShips}**: ${t(LanguageKeys.Globals.AndListValue, { value: personStarships })}`
						: undefined,
					personVehicles.length
						? `**${peopleTitles.ownedVehicles}**: ${t(LanguageKeys.Globals.AndListValue, { value: personVehicles })}`
						: undefined,
					personFilms.length
						? `**${peopleTitles.appearedInFilms}**: ${t(LanguageKeys.Globals.AndListValue, { value: personFilms })}`
						: undefined
				]
					.filter(Boolean)
					.join('\n');

				return embed
					.setTitle(result.name) //
					.setDescription(description);
			});
		}

		await display.start(loadingMessage as GuildMessage, message.author);
		return loadingMessage;
	}

	public async [Resource.Films](message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const [query, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, t)]);

		const filmsData = await this.fetchApi<Resource.Films>({ resource: Resource.Films, query });

		if (filmsData.count === 0) return this.error(LanguageKeys.Commands.Tools.StarWarsNoResult, { query });

		const { films: filmTitles } = t(LanguageKeys.Commands.Tools.StarWarsEmbedTitles);

		const display = new UserLazyPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.context.db.fetchColor(message))
				.setFooter(Footer)
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		for (const result of filmsData.results) {
			display
				.addPageEmbed((embed) => {
					const description = [
						`**${filmTitles.episodeId}**: ${result.episode_id}`, //
						`**${filmTitles.releaseDate}**: ${t(LanguageKeys.Globals.DateValue, { value: new Date(result.release_date) })}`, //
						`**${filmTitles.director}**: ${t(LanguageKeys.Globals.AndListValue, { value: result.director.split(', ') })}`, //
						`**${filmTitles.producer}**: ${t(LanguageKeys.Globals.AndListValue, { value: result.producer.split(', ') })}` //
					].join('\n');

					return embed
						.setTitle(result.title) //
						.setDescription(description);
				})
				.addPageEmbed((embed) =>
					embed
						.setTitle(result.title) //
						.setDescription(cutText(result.opening_crawl, 2048))
				)
				.addAsyncPageEmbed(async (embed) => {
					const filmCharacters: string[] = [];
					const filmPlanets: string[] = [];
					const filmSpecies: string[] = [];
					const filmStarships: string[] = [];
					const filmVehicles: string[] = [];

					for (const character of result.characters.slice(0, 3)) {
						const characterData = await this.fetchApi<Resource.People, StarWars.DetailOrSearch.Detail, false>({
							url: character,
							throwOnError: false
						});

						if (characterData) {
							filmCharacters.push(`\`${characterData.name}\``);
						}
					}

					for (const planet of result.planets.slice(0, 3)) {
						const planetsData = await this.fetchApi<Resource.Planets, StarWars.DetailOrSearch.Detail, false>({
							url: planet,
							throwOnError: false
						});

						if (planetsData) {
							filmPlanets.push(`\`${planetsData.name}\``);
						}
					}

					for (const species of result.species.slice(0, 3)) {
						const speciesData = await this.fetchApi<Resource.Species, StarWars.DetailOrSearch.Detail, false>({
							url: species,
							throwOnError: false
						});

						if (speciesData) {
							filmSpecies.push(`\`${speciesData.name}\``);
						}
					}

					for (const starship of result.starships.slice(0, 3)) {
						const starshipData = await this.fetchApi<Resource.Starships, StarWars.DetailOrSearch.Detail, false>({
							url: starship,
							throwOnError: false
						});

						if (starshipData) {
							filmStarships.push(`\`${starshipData.name}\``);
						}
					}

					for (const vehicle of result.vehicles.slice(0, 3)) {
						const vehicleData = await this.fetchApi<Resource.Vehicles, StarWars.DetailOrSearch.Detail, false>({
							url: vehicle,
							throwOnError: false
						});

						if (vehicleData) {
							filmVehicles.push(`\`${vehicleData.name}\``);
						}
					}

					const description = [
						filmCharacters.length
							? `**${filmTitles.characters}**: ${t(LanguageKeys.Globals.AndListValue, { value: filmCharacters })}`
							: undefined,
						filmPlanets.length ? `**${filmTitles.planets}**: ${t(LanguageKeys.Globals.AndListValue, { value: filmPlanets })}` : undefined,
						filmSpecies.length ? `**${filmTitles.species}**: ${t(LanguageKeys.Globals.AndListValue, { value: filmSpecies })}` : undefined,
						filmStarships.length
							? `**${filmTitles.starships}**: ${t(LanguageKeys.Globals.AndListValue, { value: filmStarships })}`
							: undefined,
						filmVehicles.length
							? `**${filmTitles.vehicles}**: ${t(LanguageKeys.Globals.AndListValue, { value: filmVehicles })}`
							: undefined
					]
						.filter(Boolean)
						.join('\n\n');

					return embed
						.setTitle(result.title) //
						.setDescription(description);
				});
		}

		await display.start(loadingMessage as GuildMessage, message.author);
		return loadingMessage;
	}

	public async [Resource.Planets](message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const [query, loadingMessage] = await Promise.all([args.rest('string'), sendLoadingMessage(message, t)]);

		const planetData = await this.fetchApi<Resource.Planets>({ resource: Resource.Planets, query });

		if (planetData.count === 0) return this.error(LanguageKeys.Commands.Tools.StarWarsNoResult, { query });

		const { planets: planetTitles } = t(LanguageKeys.Commands.Tools.StarWarsEmbedTitles);
		const display = new UserLazyPaginatedMessage({
			template: new MessageEmbed() //
				.setColor(await this.context.db.fetchColor(message))
				.setFooter(Footer)
				.setThumbnail(CdnUrls.StarWarsLogo)
		});

		for (const result of planetData.results) {
			display.addAsyncPageEmbed(async (embed) => {
				const planetFilms: string[] = [];

				for (const film of result.films) {
					const filmData = await this.fetchApi<Resource.Films, StarWars.DetailOrSearch.Detail, false>({
						url: film,
						throwOnError: false
					});

					if (filmData) {
						planetFilms.push(filmData.title);
					}
				}

				const description = [
					`**${planetTitles.diameter}**: ${t(LanguageKeys.Globals.NumberValue, { value: result.diameter })}`,
					`**${planetTitles.climate}**: ${t(LanguageKeys.Globals.AndListValue, { value: result.climate.split(', ').map(toTitleCase) })}`,
					`**${planetTitles.terrain}**: ${t(LanguageKeys.Globals.AndListValue, { value: result.terrain.split(', ').map(toTitleCase) })}`,
					result.surface_water === 'unknown' ? undefined : `**${planetTitles.surfaceWaterPercentage}**: ${result.surface_water}%`,
					`**${planetTitles.rotationPeriod}**: ${result.rotation_period}`,
					`**${planetTitles.orbitalPeriod}**: ${result.orbital_period}`,
					`**${planetTitles.averageSentientPopulation}**: ${t(LanguageKeys.Globals.NumberCompactValue, { value: result.population })}`,
					planetFilms.length
						? `**${planetTitles.appearedInFilms}**: ${t(LanguageKeys.Globals.AndListValue, { value: planetFilms })}`
						: undefined
				]
					.filter(Boolean)
					.join('\n');

				return embed.setTitle(result.name).setDescription(description);
			});
		}

		await display.start(loadingMessage as GuildMessage, message.author);
		return loadingMessage;
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

	// private async fetchApi<
	// 	R extends StarWars.Resource,
	// 	D extends StarWars.DetailOrSearch = StarWars.DetailOrSearch.Search,
	// 	E extends boolean = true
	// >({ resource, query, url, throwOnError = true }: StarWars.FetchApiParameters): StarWars.FetchApiReturnType<R, D, E> {
	// 	try {
	// 		url ??= new URL(`${BaseUrl}/${resource}`);

	// 		if (url instanceof URL) {
	// 			url.searchParams.append('search', query!);
	// 		}

	// 		return await fetch(url, FetchResultTypes.JSON);
	// 	} catch {
	// 		if (throwOnError) {
	// 			this.error(LanguageKeys.Commands.Tools.StarWarsNoResult, { query });
	// 		}

	// 		return undefined as unknown as StarWars.FetchApiReturnType<R, D, E>;
	// 	}
	// }

	private async fetchApi(resource: Resource) {
		try {
		} catch {}
	}
}
