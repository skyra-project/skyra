import { DexDetails, GenderEntry, StatsEntry } from '@favware/graphql-pokemon';
import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetchGraphQLPokemon, getPokemonDetailsByFuzzy, parseBulbapediaURL, POKEMON_EMBED_THUMBNAIL, resolveColour } from '../../lib/util/Pokemon';

enum BaseStats {
	hp = 'HP',
	attack = 'ATK',
	defense = 'DEF',
	specialattack = 'SPA',
	specialdefense = 'SPD',
	speed = 'SPE'
}

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pokemon', 'dex'],
			cooldown: 10,
			description: language => language.tget('COMMAND_POKEDEX_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_POKEDEX_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<pokemon:str>',
			flagSupport: true
		});
	}

	public async run(message: KlasaMessage, [pokemon]: [string]) {
		const pokeDetails = await this.fetchAPI(message, pokemon.toLowerCase());

		// Parse abilities
		const abilities: string[] = [];
		for (const [type, ability] of Object.entries(pokeDetails.abilities)) {
			if (!ability) continue;
			abilities.push(type === 'hidden' ? `*${ability}*` : ability);
		}

		// Parse base stats
		const baseStats: string[] = [];
		for (const [stat, value] of Object.entries(pokeDetails.baseStats)) {
			baseStats.push(`${BaseStats[stat as keyof Omit<StatsEntry, '__typename'>]}: **${value}**`);
		}

		// Set evochain if there are no evolutions
		let evoChain = `**${toTitleCase(pokeDetails.species)} ${pokeDetails.evolutionLevel ? `(${pokeDetails.evolutionLevel})` : ''}**`;
		if (!pokeDetails.evolutions?.length && !pokeDetails.preevolutions?.length) {
			evoChain += ' (No Evolutions)';
		}

		// Parse pre-evolutions and add to evochain
		if (pokeDetails.preevolutions?.length) {
			const { evolutionLevel } = pokeDetails.preevolutions[0];
			evoChain = this.parseEvoChain(pokeDetails.preevolutions[0].species, evolutionLevel, evoChain, false);

			// If the direct pre-evolution has another pre-evolution (charizard -> charmeleon -> charmander)
			if (pokeDetails.preevolutions[0].preevolutions?.length) {
				evoChain = this.parseEvoChain(pokeDetails.preevolutions[0].preevolutions[0].species, null, evoChain, false);
			}
		}

		// Parse evolution chain and add to evochain
		if (pokeDetails.evolutions?.length) {
			evoChain = this.parseEvoChain(pokeDetails.evolutions[0].species, pokeDetails.evolutions[0].evolutionLevel, evoChain);

			// In case there are multiple evolutionary paths
			const otherFormeEvos = pokeDetails.evolutions.slice(1);
			if (otherFormeEvos.length) {
				evoChain = `${evoChain}, ${otherFormeEvos.map(oevo => `\`${oevo.species}\` (${oevo.evolutionLevel})`).join(', ')}`;
			}

			// If the direct evolution has another evolution (charmander -> charmeleon -> charizard)
			if (pokeDetails.evolutions[0].evolutions?.length) {
				evoChain = this.parseEvoChain(pokeDetails.evolutions[0].evolutions[0].species, pokeDetails.evolutions[0].evolutions[0].evolutionLevel, evoChain);
			}
		}

		const embedTranslations = message.language.tget('COMMAND_POKEDEX_EMBED_DATA');
		return message.sendEmbed(new MessageEmbed()
			.setColor(resolveColour(pokeDetails.color))
			.setAuthor(`#${pokeDetails.num} - ${toTitleCase(pokeDetails.species)}`, POKEMON_EMBED_THUMBNAIL)
			.setThumbnail(message.flagArgs.shiny ? pokeDetails.shinySprite : pokeDetails.sprite)
			.addField(embedTranslations.TYPES, pokeDetails.types.join(', '), true)
			.addField(embedTranslations.ABILITIES, abilities.join(', '), true)
			.addField(embedTranslations.GENDER_RATIO, this.parseGenderRatio(pokeDetails.gender), true)
			.addField(embedTranslations.SMOGON_TIER, pokeDetails.smogonTier, true)
			.addField(embedTranslations.HEIGHT, `${pokeDetails.height}m`, true)
			.addField(embedTranslations.WEIGHT, `${pokeDetails.weight}kg`, true)
			.addField(embedTranslations.EGG_GROUPS, pokeDetails.eggGroups?.join(', ') || '', true)
			.addBlankField(true)
			.addField(embedTranslations.OTHER_FORMES, pokeDetails.otherFormes?.join(', ') || embedTranslations.NONE, true)
			.addField(embedTranslations.EVOLUTIONARY_LINE, evoChain)
			.addField(embedTranslations.BASE_STATS, baseStats.join(', '))
			.addField(embedTranslations.FLAVOUR_TEXT, `\`(${pokeDetails.flavorTexts[0].game})\` ${pokeDetails.flavorTexts[0].flavor}`)
			.addField(embedTranslations.EXTERNAL_RESOURCES, [
				`[Bulbapedia](${parseBulbapediaURL(pokeDetails.bulbapediaPage)} )`,
				`[Serebii](${pokeDetails.serebiiPage})`,
				`[Smogon](${pokeDetails.smogonPage})`
			].join(' | ')));
	}

	private async fetchAPI(message: KlasaMessage, pokemon: string) {
		try {
			const { data } = await fetchGraphQLPokemon<'getPokemonDetailsByFuzzy'>(getPokemonDetailsByFuzzy(pokemon));
			return data.getPokemonDetailsByFuzzy;
		} catch {
			throw message.language.tget('COMMAND_POKEDEX_QUERY_FAIL', pokemon);
		}
	}

	private parseEvoChain(species: DexDetails['species'], level: DexDetails['evolutionLevel'], evoChain: string, isEvo = true) {
		if (isEvo) {
			return `${evoChain} → \`${toTitleCase(species)}\` ${level ? `(${level})` : ''}`;
		}
		return `\`${toTitleCase(species)}\` ${level ? `(${level})` : ''} → ${evoChain}`;
	}

	private parseGenderRatio(genderRatio: GenderEntry) {
		if (genderRatio.male === '0%' && genderRatio.female === '0%') {
			return 'Genderless';
		}

		return `${genderRatio.male} ♂ | ${genderRatio.female} ♀`;
	}

}
