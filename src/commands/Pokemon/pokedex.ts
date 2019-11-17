import { DexDetails, GenderEntry, StatsEntry } from '@favware/graphql-pokemon';
import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getPokemonDetailsByFuzzy, GraphQLPokemonResponse, parseBulbapediaURL, POKEMON_EMBED_THUMBNAIL, POKEMON_GRAPHQL_API_URL } from '../../lib/util/Pokedex';
import { fetch } from '../../lib/util/util';

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
		try {
			const { getPokemonDetailsByFuzzy: poke } = (await this.fetchAPI(message, pokemon.toLowerCase())).data;

			// Parse abilities
			const abilities: string[] = [];
			for (const [type, ability] of Object.entries(poke.abilities)) {
				if (!ability) continue;
				abilities.push(type === 'hidden' ? `*${ability}*` : ability);
			}

			// Parse base stats
			const baseStats: string[] = [];
			for (const [stat, value] of Object.entries(poke.baseStats)) {
				baseStats.push(`${BaseStats[stat as keyof Omit<StatsEntry, '__typename'>]}: **${value}**`);
			}

			// Set evochain if there are no evolutions
			let evoChain = `**${toTitleCase(poke.species)} ${poke.evolutionLevel ? `(${poke.evolutionLevel})` : ''}**`;
			if (!poke.evolutions?.length && !poke.preevolutions?.length) {
				evoChain += ' (No Evolutions)';
			}

			// Parse pre-evolutions and add to evochain
			if (poke.preevolutions?.length) {
				const { evolutionLevel } = poke.preevolutions[0];
				evoChain = this.parseEvoChain(poke.preevolutions[0].species, evolutionLevel, evoChain, false);

				// If the direct pre-evolution has another pre-evolution (charizard -> charmeleon -> charmander)
				if (poke.preevolutions[0].preevolutions?.length) {
					evoChain = this.parseEvoChain(poke.preevolutions[0].preevolutions[0].species, null, evoChain, false);
				}
			}

			// Parse evolution chain and add to evochain
			if (poke.evolutions?.length) {
				evoChain = this.parseEvoChain(poke.evolutions[0].species, poke.evolutions[0].evolutionLevel, evoChain);

				// In case there are multiple evolutionary paths
				const otherFormeEvos = poke.evolutions.slice(1);
				if (otherFormeEvos.length) {
					evoChain = `${evoChain}, ${otherFormeEvos.map(oevo => `\`${oevo.species}\` (${oevo.evolutionLevel})`).join(', ')}`;
				}

				// If the direct evolution has another evolution (charmander -> charmeleon -> charizard)
				if (poke.evolutions[0].evolutions?.length) {
					evoChain = this.parseEvoChain(poke.evolutions[0].evolutions[0].species, poke.evolutions[0].evolutions[0].evolutionLevel, evoChain);
				}
			}

			const embedTranslations = message.language.tget('COMMAND_POKEDEX_EMBED_DATA');
			return message.sendEmbed(new MessageEmbed()
				.setColor(this.resolveColour(poke.color))
				.setAuthor(`#${poke.num} - ${toTitleCase(poke.species)}`, POKEMON_EMBED_THUMBNAIL)
				.setThumbnail(message.flagArgs.shiny ? poke.shinySprite : poke.sprite)
				.addField(embedTranslations.TYPES, poke.types.join(', '), true)
				.addField(embedTranslations.ABILITIES, abilities.join(', '), true)
				.addField(embedTranslations.GENDER_RATIO, this.parseGenderRatio(poke.gender), true)
				.addField(embedTranslations.SMOGON_TIER, poke.smogonTier, true)
				.addField(embedTranslations.HEIGHT, `${poke.height}m`, true)
				.addField(embedTranslations.WEIGHT, `${poke.weight}kg`, true)
				.addField(embedTranslations.EGG_GROUPS, poke.eggGroups?.join(', ') || '', true)
				.addBlankField(true)
				.addField(embedTranslations.OTHER_FORMES, poke.otherFormes?.join(', ') || embedTranslations.NONE, true)
				.addField(embedTranslations.EVOLUTIONARY_LINE, evoChain)
				.addField(embedTranslations.BASE_STATS, baseStats.join(', '))
				.addField(embedTranslations.FLAVOUR_TEXT, `\`(${poke.flavorTexts[0].game})\` ${poke.flavorTexts[0].flavor}`)
				.addField(embedTranslations.EXTERNAL_RESOURCES, [
					`[Bulbapedia](${parseBulbapediaURL(poke.bulbapediaPage)} )`,
					`[Serebii](${poke.serebiiPage})`,
					`[Smogon](${poke.smogonPage})`
				].join(' | ')));
		} catch (err) {
			throw message.language.tget('COMMAND_POKEDEX_QUERY_FAIL', pokemon);
		}
	}

	private async fetchAPI(message: KlasaMessage, pokemon: string) {
		try {
			return await fetch(POKEMON_GRAPHQL_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query: getPokemonDetailsByFuzzy(pokemon)
				})
			}, 'json') as Promise<GraphQLPokemonResponse<'getPokemonDetailsByFuzzy'>>;
		} catch (err) {
			throw message.language.tget('SYSTEM_QUERY_FAIL');
		}
	}

	private resolveColour(col: string) {
		switch (col) {
			case 'Black':
				return 0x323232;
			case 'Blue':
				return 0x257CFF;
			case 'Brown':
				return 0xA3501A;
			case 'Gray':
				return 0x969696;
			case 'Green':
				return 0x3EFF4E;
			case 'Pink':
				return 0xFF65A5;
			case 'Purple':
				return 0xA63DE8;
			case 'Red':
				return 0xFF3232;
			case 'White':
				return 0xE1E1E1;
			case 'Yellow':
				return 0xFFF359;
			default:
				return 0xFF0000;
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
