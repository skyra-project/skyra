import { AbilitiesEntry, DexDetails, GenderEntry, StatsEntry } from '@favware/graphql-pokemon';
import { toTitleCase } from '@klasa/utils';
import { RichDisplayCommand, RichDisplayCommandOptions } from '@lib/structures/RichDisplayCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { CdnUrls } from '@lib/types/Constants';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { fetchGraphQLPokemon, getPokemonDetailsByFuzzy, parseBulbapediaURL, resolveColour } from '@utils/Pokemon';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, LanguageKeys } from 'klasa';

enum BaseStats {
	hp = 'HP',
	attack = 'ATK',
	defense = 'DEF',
	specialattack = 'SPA',
	specialdefense = 'SPD',
	speed = 'SPE'
}

@ApplyOptions<RichDisplayCommandOptions>({
	aliases: ['pokemon', 'dex', 'mon', 'poke', 'dexter'],
	cooldown: 10,
	description: (language) => language.get('COMMAND_POKEDEX_DESCRIPTION'),
	extendedHelp: (language) => language.get('COMMAND_POKEDEX_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	usage: '<pokemon:str>',
	flagSupport: true
})
export default class extends RichDisplayCommand {
	public async run(message: KlasaMessage, [pokemon]: [string]) {
		const response = await message.sendEmbed(
			new MessageEmbed().setDescription(message.language.get('SYSTEM_LOADING')).setColor(BrandingColors.Secondary)
		);
		const pokeDetails = await this.fetchAPI(message, pokemon.toLowerCase());

		await this.buildDisplay(message, pokeDetails).start(response, message.author.id);
		return response;
	}

	private async fetchAPI(message: KlasaMessage, pokemon: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonDetailsByFuzzy, { pokemon });
			return data.getPokemonDetailsByFuzzy;
		} catch {
			throw message.language.get('COMMAND_POKEDEX_QUERY_FAIL', { pokemon });
		}
	}

	/**
	 * Constructs a link in the evolution chain
	 * @param species Name of the pokemon that the evolution goes to
	 * @param level Level the evolution happens
	 * @param evoChain The current evolution chain
	 * @param isEvo Whether this is an evolution or pre-evolution
	 */
	private constructEvoLink(species: DexDetails['species'], level: DexDetails['evolutionLevel'], evoChain: string, isEvo = true) {
		if (isEvo) {
			return `${evoChain} → \`${toTitleCase(species)}\` ${level ? `(${level})` : ''}`;
		}
		return `\`${toTitleCase(species)}\` ${level ? `(${level})` : ''} → ${evoChain}`;
	}

	/**
	 * Parse the gender ratios to an embeddable format
	 */
	private parseGenderRatio(genderRatio: GenderEntry) {
		if (genderRatio.male === '0%' && genderRatio.female === '0%') {
			return 'Genderless';
		}

		return `${genderRatio.male} ♂ | ${genderRatio.female} ♀`;
	}

	/**
	 * Parses abilities to an embeddable format
	 * @remark required to distuingish hidden abilities from regular abilities
	 * @returns an array of abilities
	 */
	private getAbilities(abilitiesData: AbilitiesEntry): string[] {
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
	private getBaseStats(statsData: StatsEntry): string[] {
		const baseStats: string[] = [];
		for (const [stat, value] of Object.entries(statsData)) {
			baseStats.push(`${BaseStats[stat as keyof Omit<StatsEntry, '__typename'>]}: **${value}**`);
		}

		return baseStats;
	}

	/**
	 * Parses the evolution chain to an embeddable formaet
	 * @returns The evolution chain for the Pokémon
	 */
	private getEvoChain(pokeDetails: DexDetails): string {
		// Set evochain if there are no evolutions
		let evoChain = `**${toTitleCase(pokeDetails.species)} ${pokeDetails.evolutionLevel ? `(${pokeDetails.evolutionLevel})` : ''}**`;
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

	private buildDisplay(message: KlasaMessage, pokeDetails: DexDetails) {
		const abilities = this.getAbilities(pokeDetails.abilities);
		const baseStats = this.getBaseStats(pokeDetails.baseStats);
		const evoChain = this.getEvoChain(pokeDetails);
		const embedTranslations = message.language.get('COMMAND_POKEDEX_EMBED_DATA');

		if (pokeDetails.num <= 0) return this.parseCAPPokemon({ message, pokeDetails, abilities, baseStats, evoChain, embedTranslations });
		return this.parseRegularPokemon({ message, pokeDetails, abilities, baseStats, evoChain, embedTranslations });
	}

	private parseCAPPokemon({ message, pokeDetails, abilities, baseStats, evoChain, embedTranslations }: PokemonToDisplayArgs) {
		return new UserRichDisplay(
			new MessageEmbed()
				.setColor(resolveColour(pokeDetails.color))
				.setAuthor(`#${pokeDetails.num} - ${toTitleCase(pokeDetails.species)}`, CdnUrls.Pokedex)
				.setThumbnail(message.flagArgs.shiny ? pokeDetails.shinySprite : pokeDetails.sprite)
		)
			.addPage((embed: MessageEmbed) =>
				embed
					.addField(embedTranslations.TYPES, pokeDetails.types.join(', '), true)
					.addField(embedTranslations.ABILITIES, abilities.join(', '), true)
					.addField(embedTranslations.GENDER_RATIO, this.parseGenderRatio(pokeDetails.gender), true)
					.addField(embedTranslations.EVOLUTIONARY_LINE, evoChain)
					.addField(
						embedTranslations.BASE_STATS,
						`${baseStats.join(', ')} (*${embedTranslations.BASE_STATS_TOTAL}*: **${pokeDetails.baseStatsTotal}**)`
					)
			)
			.addPage((embed: MessageEmbed) =>
				embed
					.addField(embedTranslations.HEIGHT, `${pokeDetails.height}m`, true)
					.addField(embedTranslations.WEIGHT, `${pokeDetails.weight}kg`, true)
					.addField(embedTranslations.EGG_GROUPS, pokeDetails.eggGroups?.join(', ') || '', true)
					.addField(embedTranslations.SMOGON_TIER, pokeDetails.smogonTier, true)
			);
	}

	private parseRegularPokemon({ message, pokeDetails, abilities, baseStats, evoChain, embedTranslations }: PokemonToDisplayArgs) {
		const externalResourceData = [
			`[Bulbapedia](${parseBulbapediaURL(pokeDetails.bulbapediaPage)} )`,
			`[Serebii](${pokeDetails.serebiiPage})`,
			`[Smogon](${pokeDetails.smogonPage})`
		].join(' | ');

		const display = new UserRichDisplay(
			new MessageEmbed()
				.setColor(resolveColour(pokeDetails.color))
				.setAuthor(`#${pokeDetails.num} - ${toTitleCase(pokeDetails.species)}`, CdnUrls.Pokedex)
				.setThumbnail(message.flagArgs.shiny ? pokeDetails.shinySprite : pokeDetails.sprite)
		)
			.addPage((embed: MessageEmbed) =>
				embed
					.addField(embedTranslations.TYPES, pokeDetails.types.join(', '), true)
					.addField(embedTranslations.ABILITIES, abilities.join(', '), true)
					.addField(embedTranslations.GENDER_RATIO, this.parseGenderRatio(pokeDetails.gender), true)
					.addField(embedTranslations.EVOLUTIONARY_LINE, evoChain)
					.addField(
						embedTranslations.BASE_STATS,
						`${baseStats.join(', ')} (*${embedTranslations.BASE_STATS_TOTAL}*: **${pokeDetails.baseStatsTotal}**)`
					)

					.addField(embedTranslations.EXTERNAL_RESOURCES, externalResourceData)
			)
			.addPage((embed: MessageEmbed) => {
				embed
					.addField(embedTranslations.HEIGHT, `${pokeDetails.height}m`, true)
					.addField(embedTranslations.WEIGHT, `${pokeDetails.weight}kg`, true)
					.addField(embedTranslations.EGG_GROUPS, pokeDetails.eggGroups?.join(', ') || '', true);

				return embed.addField(embedTranslations.EXTERNAL_RESOURCES, externalResourceData);
			})
			.addPage((embed: MessageEmbed) =>
				embed
					.addField(embedTranslations.SMOGON_TIER, pokeDetails.smogonTier, true)
					.addField(embedTranslations.FLAVOUR_TEXT, `\`(${pokeDetails.flavorTexts[0].game})\` ${pokeDetails.flavorTexts[0].flavor}`)

					.addField(embedTranslations.EXTERNAL_RESOURCES, externalResourceData)
			);

		// If there are any cosmetic formes or other formes then add a page for them
		// If the pokémon doesn't have the formes then the API will default them to `null`
		if (pokeDetails.cosmeticFormes || pokeDetails.otherFormes) {
			display.addPage((embed: MessageEmbed) => {
				// If the pokémon has other formes
				if (pokeDetails.otherFormes) {
					embed.addField(embedTranslations.OTHER_FORMES_TITLE, embedTranslations.FORMES_LIST({ formes: pokeDetails.otherFormes }));
				}

				// If the pokémon has cosmetic formes
				if (pokeDetails.cosmeticFormes) {
					embed.addField(embedTranslations.COSMETIC_FORMES_TITLE, embedTranslations.FORMES_LIST({ formes: pokeDetails.cosmeticFormes! }));
				}

				// Add the external resource field
				embed.addField(embedTranslations.EXTERNAL_RESOURCES, externalResourceData);

				return embed;
			});
		}

		return display;
	}
}

interface PokemonToDisplayArgs {
	message: KlasaMessage;
	pokeDetails: DexDetails;
	abilities: string[];
	baseStats: string[];
	evoChain: string;
	embedTranslations: LanguageKeys['COMMAND_POKEDEX_EMBED_DATA'];
}
