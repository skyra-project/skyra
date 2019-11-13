import { toTitleCase } from '@klasa/utils';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getPokemonDetailsByFuzzy, GraphQLPokemonResponse, POKEMON_GRAPHQL_API_URL, POKEMON_EMBED_THUMBNAIL, parseBulbapediaURL } from '../../lib/util/Pokedex';
import { fetch } from '../../lib/util/util';

const BaseStats: Record<string, string> = {
	hp: 'HP',
	attack: 'ATK',
	defense: 'DEF',
	specialattack: 'SPA',
	specialdefense: 'SPD',
	speed: 'SPE'
};

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['pokemon', 'dex'],
			cooldown: 10,
			description: language => language.tget('COMMAND_POKEDEX_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_POKEDEX_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			usage: '<pokemon:str>'
		});
	}

	public async run(message: KlasaMessage, [pokemon]: [string]) {
		try {
			const embedTranslations = message.language.tget('COMMAND_POKEDEX_EMBED_DATA');
			const { getPokemonDetailsByFuzzy: poke } = (await this.fetchAPI(message, pokemon)).data;

			const baseStats: string[] = [];
			let abilities = '';
			let genders = '';
			let evoChain = `**${toTitleCase(poke.species)}**`;

			// Parse abilities
			for (const [type, ability] of Object.entries(poke.abilities)) {
				if (ability !== null) {
					switch (type) {
						case 'first':
							abilities += ability;
							break;
						case 'hidden':
							abilities += `, *${ability}*`;
							break;
						case 'second':
						case 'special':
							abilities += `, ${ability}`;
					}
				}
			}

			// Parse base stats
			for (const [stat, value] of Object.entries(poke.baseStats)) {
				baseStats.push(`${BaseStats[stat]}: **${value}**`);
			}

			// Parse gender ratio
			for (const [gender, ratio] of Object.entries(poke.gender)) {
				switch (gender) {
					case 'male':
						genders += `${ratio} ♂ `;
						break;
					case 'female':
						genders += ` | ${ratio} ♀`;
						break;
				}
			}

			// Set evochain if there are no evolutions
			if (!poke.evolutions?.length && !poke.preevolutions?.length) {
				evoChain += ' (No Evolutions)';
			}

			// Parse pre-evolutions and add to evochain
			if (poke.preevolutions?.length) {
				const { evolutionLevel } = poke.preevolutions[0];
				evoChain = `\`${toTitleCase(poke.preevolutions[0].species)}\` ${evolutionLevel ? `(${evolutionLevel})` : ''} → ${evoChain} **(${poke.evolutionLevel})**`;

				// If the direct pre-evolution has another pre-evolution (charizard -> charmeleon -> charmander)
				if (poke.preevolutions[0].preevolutions?.length) {
					evoChain = `\`${toTitleCase(poke.preevolutions[0].preevolutions[0].species)}\` → ${evoChain}`;
				}
			}

			// Parse evolution chain and add to evochain
			if (poke.evolutions?.length) {
				evoChain = `${evoChain} → \`${toTitleCase(poke.evolutions[0].species)}\` (${poke.evolutions[0].evolutionLevel})`;

				// In case there are multiple evolutionary paths
				const otherFormeEvos = poke.evolutions.slice(1);
				if (otherFormeEvos.length) {
					evoChain = `${evoChain}, ${otherFormeEvos.map(oevo => `\`${oevo.species}\` (${oevo.evolutionLevel})`).join(', ')}`;
				}

				// If the direct evolution has another evolution (charmander -> charmeleon -> charizard)
				if (poke.evolutions[0].evolutions?.length) {
					evoChain = `${evoChain} → \`${toTitleCase(poke.evolutions[0].evolutions[0].species)}\` (${poke.evolutions[0].evolutions[0].evolutionLevel})`;
				}
			}

			return message.sendEmbed(new MessageEmbed()
				.setColor(this.resolveColour(poke.color))
				.setAuthor(`#${poke.num} - ${toTitleCase(poke.species)}`, poke.sprite)
				.setImage(poke.sprite)
				.setThumbnail(POKEMON_EMBED_THUMBNAIL)
				.addField(embedTranslations.types, poke.types.join(', '), true)
				.addField(embedTranslations.abilities, abilities, true)
				.addField(embedTranslations.genderRatio, genders, true)
				.addField(embedTranslations.smogonTier, poke.smogonTier, true)
				.addField(embedTranslations.height, `${poke.height}m`, true)
				.addField(embedTranslations.weight, `${poke.weight}kg`, true)
				.addField(embedTranslations.eggGroups, poke.eggGroups?.join(', ') || '', true)
				.addBlankField(true)
				.addField(embedTranslations.otherFormes, poke.otherFormes?.join(', ') || embedTranslations.none, true)
				.addField(embedTranslations.evolutionaryLine, evoChain)
				.addField(embedTranslations.baseStats, baseStats.join(', '))
				.addField(embedTranslations.flavourText, `\`(${poke.flavorTexts[0].game})\` ${poke.flavorTexts[0].flavor}`)
				.addField(embedTranslations.externalResources, [
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
			return fetch(POKEMON_GRAPHQL_API_URL, {
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
				return '#323232';
			case 'Blue':
				return '#257CFF';
			case 'Brown':
				return '#A3501A';
			case 'Gray':
				return '#969696';
			case 'Green':
				return '#3EFF4E';
			case 'Pink':
				return '#FF65A5';
			case 'Purple':
				return '#A63DE8';
			case 'Red':
				return '#FF3232';
			case 'White':
				return '#E1E1E1';
			case 'Yellow':
				return '#FFF359';
			default:
				return '#FF0000';
		}
	}

}
