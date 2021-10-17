import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { PokedexEmbedDataReturn } from '#lib/i18n/languageKeys/keys/commands/Pokemon';
import { PaginatedMessageCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import {
	fetchGraphQLPokemon,
	getFuzzyPokemon,
	GetPokemonSpriteParameters,
	getSpriteKey,
	parseBulbapediaURL,
	resolveColour
} from '#utils/APIs/Pokemon';
import { CdnUrls, Emojis } from '#utils/constants';
import { formatNumber } from '#utils/functions';
import { formatBoolean } from '#utils/functions/booleans';
import { sendLoadingMessage } from '#utils/util';
import type { Abilities, EvYields, Gender, Pokemon, Stats } from '@favware/graphql-pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { filterNullish, isNullish, toTitleCase } from '@sapphire/utilities';
import { MessageEmbed } from 'discord.js';
import type { TFunction } from 'i18next';

enum StatsEnum {
	hp = 'HP',
	attack = 'ATK',
	defense = 'DEF',
	specialattack = 'SPA',
	specialdefense = 'SPD',
	speed = 'SPE'
}

@ApplyOptions<PaginatedMessageCommand.Options>({
	aliases: ['pokemon', 'dex', 'mon', 'poke', 'dexter'],
	description: LanguageKeys.Commands.Pokemon.PokedexDescription,
	detailedDescription: LanguageKeys.Commands.Pokemon.PokedexExtended,
	flags: ['shiny', 'back']
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public async messageRun(message: GuildMessage, args: PaginatedMessageCommand.Args) {
		const { t } = args;
		const response = await sendLoadingMessage(message, t);

		const pokemon = (await args.rest('string')).toLowerCase();
		const backSprite = args.getFlags('back');
		const shinySprite = args.getFlags('shiny');

		const pokeDetails = await this.fetchAPI(pokemon.toLowerCase(), { backSprite, shinySprite });

		await this.buildDisplay(pokeDetails, t, { backSprite, shinySprite }).run(response, message.author);
		return response;
	}

	private async fetchAPI(pokemon: string, getSpriteParams: GetPokemonSpriteParameters) {
		try {
			const {
				data: { getFuzzyPokemon: result }
			} = await fetchGraphQLPokemon<'getFuzzyPokemon'>(getFuzzyPokemon(getSpriteParams), { pokemon });

			if (!result.length) {
				this.error(LanguageKeys.Commands.Pokemon.PokedexQueryFail, { pokemon });
			}

			return result[0];
		} catch {
			this.error(LanguageKeys.Commands.Pokemon.PokedexQueryFail, { pokemon });
		}
	}

	/**
	 * Constructs a link in the evolution chain
	 * @param species Name of the pokemon that the evolution goes to
	 * @param level Level the evolution happens
	 * @param evoChain The current evolution chain
	 * @param isEvo Whether this is an evolution or pre-evolution
	 */
	private constructEvoLink(species: Pokemon['species'], level: Pokemon['evolutionLevel'], evoChain: string, isEvo = true) {
		if (isEvo) {
			return `${evoChain} → \`${toTitleCase(species)}\` ${level ? `(${level})` : ''}`;
		}
		return `\`${toTitleCase(species)}\` ${level ? `(${level})` : ''} → ${evoChain}`;
	}

	/**
	 * Parse the gender ratios to an embeddable format
	 */
	private parseGenderRatio(genderRatio: Gender) {
		if (genderRatio.male === '0%' && genderRatio.female === '0%') {
			return 'Genderless';
		}

		return `${genderRatio.male} ${Emojis.MaleSignEmoji} | ${genderRatio.female} ${Emojis.FemaleSignEmoji}`;
	}

	/**
	 * Parses abilities to an embeddable format
	 * @remark required to distinguish hidden abilities from regular abilities
	 * @returns an array of abilities
	 */
	private getAbilities(abilitiesData: Abilities): string[] {
		const abilities: string[] = [];
		for (const [type, ability] of Object.entries(abilitiesData)) {
			if (!ability) continue;
			abilities.push(type === 'hidden' ? `*${ability}*` : ability);
		}

		return abilities;
	}

	/**
	 * Parses base stats to an embeddable format
	 * @returns an array of stats with their keys and values
	 */
	private getBaseStats(statsData: Stats): string[] {
		const baseStats: string[] = [];
		for (const [stat, value] of Object.entries(statsData)) {
			baseStats.push(`${StatsEnum[stat as keyof Omit<Stats, '__typename'>]}: **${value}**`);
		}

		return baseStats;
	}

	/**
	 * Parses EV yields to an embeddable format
	 * @returns an array of ev yields with their keys and values
	 */
	private getEvYields(evYieldsData: EvYields): string[] {
		const evYields: string[] = [];
		for (const [stat, value] of Object.entries(evYieldsData)) {
			evYields.push(`${StatsEnum[stat as keyof Omit<EvYields, '__typename'>]}: **${value}**`);
		}

		return evYields;
	}

	/**
	 * Parses the evolution chain to an embeddable format
	 * @returns The evolution chain for the Pokémon
	 */
	private getEvoChain(pokeDetails: Pokemon): string {
		// Set evochain if there are no evolutions
		let evoChain = `**${toTitleCase(pokeDetails.species)} ${pokeDetails.evolutionLevel ? `(${pokeDetails.evolutionLevel})` : ''}**` as string;
		if (!pokeDetails.evolutions?.length && !pokeDetails.preevolutions?.length) {
			evoChain += ' (No Evolutions)';
		}

		// Parse pre-evolutions and add to evochain
		if (pokeDetails.preevolutions?.length) {
			const { evolutionLevel } = pokeDetails.preevolutions[0];
			evoChain = this.constructEvoLink(pokeDetails.preevolutions[0].species, evolutionLevel, evoChain, false);

			// If the direct pre-evolution has another pre-evolution (charizard -> charmeleon -> charmander)
			if (pokeDetails.preevolutions[0].preevolutions?.length) {
				evoChain = this.constructEvoLink(pokeDetails.preevolutions[0].preevolutions[0].species, null, evoChain, false);
			}
		}

		// Parse evolution chain and add to evochain
		if (pokeDetails.evolutions?.length) {
			evoChain = this.constructEvoLink(pokeDetails.evolutions[0].species, pokeDetails.evolutions[0].evolutionLevel, evoChain);

			// In case there are multiple evolutionary paths
			const otherFormeEvos = pokeDetails.evolutions.slice(1);
			if (otherFormeEvos.length) {
				evoChain = `${evoChain}, ${otherFormeEvos.map((oevo) => `\`${oevo.species}\` (${oevo.evolutionLevel})`).join(', ')}`;
			}

			// If the direct evolution has another evolution (charmander -> charmeleon -> charizard)
			if (pokeDetails.evolutions[0].evolutions?.length) {
				evoChain = this.constructEvoLink(
					pokeDetails.evolutions[0].evolutions[0].species,
					pokeDetails.evolutions[0].evolutions[0].evolutionLevel,
					evoChain
				);
			}
		}

		return evoChain;
	}

	private buildDisplay(pokeDetails: Pokemon, t: TFunction, getSpriteParams: GetPokemonSpriteParameters) {
		const abilities = this.getAbilities(pokeDetails.abilities);
		const baseStats = this.getBaseStats(pokeDetails.baseStats);
		const evYields = this.getEvYields(pokeDetails.evYields);
		const evoChain = this.getEvoChain(pokeDetails);
		const spriteToGet = getSpriteKey(getSpriteParams);

		const embedTranslations = t(LanguageKeys.Commands.Pokemon.PokedexEmbedData, {
			otherFormes: pokeDetails.otherFormes ?? [],
			cosmeticFormes: pokeDetails.cosmeticFormes ?? [],
			count: pokeDetails.types.length
		});

		return this.parsePokemon({ pokeDetails, abilities, baseStats, evYields, evoChain, embedTranslations, t, spriteToGet });
	}

	private parsePokemon({
		t,
		pokeDetails,
		abilities,
		baseStats,
		evYields,
		evoChain,
		embedTranslations,
		spriteToGet
	}: PokemonToDisplayArgs): SkyraPaginatedMessage {
		const externalResources = t(LanguageKeys.System.PokedexExternalResource);
		const externalResourceData = [
			this.isMissingno(pokeDetails)
				? '[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/MissingNo.)'
				: `[Bulbapedia](${parseBulbapediaURL(pokeDetails.bulbapediaPage)} )`,
			this.isMissingno(pokeDetails) ? '[Serebii](https://www.serebii.net/pokedex/000.shtml)' : `[Serebii](${pokeDetails.serebiiPage})`,
			this.isMissingno(pokeDetails) ? undefined : `[Smogon](${pokeDetails.smogonPage})`
		]
			.filter(filterNullish)
			.join(' | ');

		const display = new SkyraPaginatedMessage({
			template: new MessageEmbed()
				.setColor(resolveColour(pokeDetails.color))
				.setAuthor(`#${pokeDetails.num} - ${toTitleCase(pokeDetails.species)}`, CdnUrls.Pokedex)
				.setThumbnail(pokeDetails[spriteToGet])
		});

		display.addPageEmbed((embed) => {
			embed
				.addField(embedTranslations.types, pokeDetails.types.join(', '), true)
				.addField(embedTranslations.abilities, t(LanguageKeys.Globals.AndListValue, { value: abilities }), true)
				.addField(embedTranslations.genderRatio, this.parseGenderRatio(pokeDetails.gender), true)
				.addField(embedTranslations.evolutionaryLine, evoChain)
				.addField(
					embedTranslations.baseStats,
					`${baseStats.join(', ')} (*${embedTranslations.baseStatsTotal}*: **${pokeDetails.baseStatsTotal}**)`
				);

			if (!this.isCapPokemon(pokeDetails)) {
				embed.addField(externalResources, externalResourceData);
			}

			return embed;
		});

		display.addPageEmbed((embed) => {
			embed
				.addField(embedTranslations.height, `${formatNumber(t, pokeDetails.height)}m`, true)
				.addField(embedTranslations.weight, `${formatNumber(t, pokeDetails.weight)}kg`, true);

			if (this.isRegularPokemon(pokeDetails)) {
				if (pokeDetails.levellingRate) {
					embed.addField(embedTranslations.levellingRate, pokeDetails.levellingRate, true);
				}
			}

			if (!this.isMissingno(pokeDetails)) {
				embed.addField(embedTranslations.eggGroups, pokeDetails.eggGroups?.join(', ') || '', true);
			}

			if (this.isRegularPokemon(pokeDetails)) {
				embed.addField(embedTranslations.isEggObtainable, formatBoolean(t, pokeDetails.isEggObtainable), true);

				if (!isNullish(pokeDetails.minimumHatchTime) && !isNullish(pokeDetails.maximumHatchTime)) {
					embed
						.addField(embedTranslations.minimumHatchingTime, formatNumber(t, pokeDetails.minimumHatchTime), true)
						.addField(embedTranslations.maximumHatchTime, formatNumber(t, pokeDetails.maximumHatchTime), true);
				}

				embed.addField(externalResources, externalResourceData);
			}

			return embed;
		});

		if (!this.isMissingno(pokeDetails)) {
			display.addPageEmbed((embed) => {
				embed //
					.addField(embedTranslations.smogonTier, pokeDetails.smogonTier)
					.addField(embedTranslations.evYields, `${evYields.join(', ')}`);

				if (this.isRegularPokemon(pokeDetails)) {
					embed.addField(externalResources, externalResourceData);
				}

				return embed;
			});
		}

		if (!this.isCapPokemon(pokeDetails)) {
			if (pokeDetails.flavorTexts.length) {
				display.addPageEmbed((embed) => {
					for (const flavor of pokeDetails.flavorTexts) {
						embed.addField(embedTranslations.flavourText, `\`(${flavor.game})\` ${flavor.flavor}`);
					}

					return embed.addField(externalResources, externalResourceData);
				});
			}
		}

		if (!this.isMissingno(pokeDetails)) {
			// If there are any cosmetic formes or other formes then add a page for them
			// If the pokémon doesn't have the formes then the API will default them to `null`
			if (pokeDetails.cosmeticFormes || pokeDetails.otherFormes) {
				display.addPageEmbed((embed) => {
					// If the pokémon has other formes
					if (pokeDetails.otherFormes) {
						embed.addField(embedTranslations.otherFormesTitle, embedTranslations.otherFormesList);
					}

					// If the pokémon has cosmetic formes
					if (pokeDetails.cosmeticFormes) {
						embed.addField(embedTranslations.cosmeticFormesTitle, embedTranslations.cosmeticFormesList);
					}

					// Add the external resource field
					embed.addField(externalResources, externalResourceData);

					return embed;
				});
			}
		}

		return display;
	}

	private isCapPokemon(pokeDetails: Pokemon) {
		return pokeDetails.num < 0;
	}

	private isRegularPokemon(pokeDetails: Pokemon) {
		return pokeDetails.num > 0;
	}

	private isMissingno(pokeDetails: Pokemon) {
		return pokeDetails.num === 0;
	}
}

interface PokemonToDisplayArgs {
	pokeDetails: Pokemon;
	abilities: string[];
	baseStats: string[];
	evYields: string[];
	evoChain: string;
	t: TFunction;
	embedTranslations: PokedexEmbedDataReturn;
	spriteToGet: ReturnType<typeof getSpriteKey>;
}
