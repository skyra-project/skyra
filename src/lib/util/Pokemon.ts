import { ENABLE_LOCAL_POKEDEX } from '#root/config';
import {
	Query,
	QueryGetAbilityDetailsByFuzzyArgs,
	QueryGetItemDetailsByFuzzyArgs,
	QueryGetMoveDetailsByFuzzyArgs,
	QueryGetPokemonDetailsByFuzzyArgs,
	QueryGetPokemonLearnsetByFuzzyArgs,
	QueryGetTypeMatchupArgs
} from '@favware/graphql-pokemon';
import { Mime } from './constants';
import { fetch, FetchMethods, FetchResultTypes, gql } from './util';

const FlavorsFrament = gql`
	fragment flavors on FlavorEntry {
		game
		flavor
	}
`;

export const getPokemonDetailsByFuzzy = gql`
	${FlavorsFrament}

	fragment abilities on AbilitiesEntry {
		first
		second
		hidden
		special
	}

	fragment stats on StatsEntry {
		hp
		attack
		defense
		specialattack
		specialdefense
		speed
	}

	fragment genders on GenderEntry {
		male
		female
	}

	fragment dexdetails on DexDetails {
		num
		species
		types
		abilities {
			...abilities
		}
		baseStats {
			...stats
		}
		gender {
			...genders
		}
		baseStatsTotal
		color
		eggGroups
		evolutionLevel
		height
		weight
		otherFormes
		cosmeticFormes
		sprite
		shinySprite
		smogonTier
		bulbapediaPage
		serebiiPage
		smogonPage
		flavorTexts {
			...flavors
		}
	}

	fragment evolutionsData on DexDetails {
		species
		evolutionLevel
	}

	fragment evolutions on DexDetails {
		evolutions {
			...evolutionsData
			evolutions {
				...evolutionsData
			}
		}
		preevolutions {
			...evolutionsData
			preevolutions {
				...evolutionsData
			}
		}
	}

	query getPokemonDetails($pokemon: String!) {
		getPokemonDetailsByFuzzy(pokemon: $pokemon, skip: 0, take: 1, reverse: true) {
			...dexdetails
			...evolutions
		}
	}
`;

export const getPokemonFlavorTextsByFuzzy = gql`
	${FlavorsFrament}

	fragment flavortexts on DexDetails {
		flavorTexts {
			...flavors
		}
	}

	query getPokemonFlavors($pokemon: String!) {
		getPokemonDetailsByFuzzy(pokemon: $pokemon, skip: 0, reverse: true) {
			sprite
			shinySprite
			num
			species
			color
			...flavortexts
		}
	}
`;

export const getAbilityDetailsByFuzzy = gql`
	fragment ability on AbilityEntry {
		desc
		shortDesc
		name
		isFieldAbility
		bulbapediaPage
		serebiiPage
		smogonPage
	}

	query getAbilityDetails($ability: String!) {
		getAbilityDetailsByFuzzy(ability: $ability, skip: 0, take: 1) {
			...ability
		}
	}
`;

export const getItemDetailsByFuzzy = gql`
	fragment items on ItemEntry {
		desc
		name
		bulbapediaPage
		serebiiPage
		smogonPage
		sprite
		isNonstandard
		generationIntroduced
	}

	query getItemDetails($item: String!) {
		getItemDetailsByFuzzy(item: $item, skip: 0, take: 1) {
			...items
		}
	}
`;

export const getPokemonLearnsetByFuzzy = gql`
	fragment learnsetLevelupMove on LearnsetLevelUpMove {
		name
		generation
		level
	}
	fragment learnsetMove on LearnsetMove {
		name
		generation
	}

	fragment learnset on LearnsetEntry {
		num
		species
		sprite
		shinySprite
		color
		levelUpMoves {
			...learnsetLevelupMove
		}
		virtualTransferMoves {
			...learnsetMove
		}
		tutorMoves {
			...learnsetMove
		}
		tmMoves {
			...learnsetMove
		}
		eggMoves {
			...learnsetMove
		}
		eventMoves {
			...learnsetMove
		}
		dreamworldMoves {
			...learnsetMove
		}
	}

	query getLearnsetDetails($pokemon: String!, $moves: [String!]!, $generation: Int) {
		getPokemonLearnsetByFuzzy(pokemon: $pokemon, moves: $moves, generation: $generation) {
			...learnset
		}
	}
`;

export const getMoveDetailsByFuzzy = gql`
	fragment moves on MoveEntry {
		name
		shortDesc
		type
		basePower
		pp
		category
		accuracy
		priority
		target
		contestType
		bulbapediaPage
		serebiiPage
		smogonPage
		isNonstandard
		isZ
		isGMax
		desc
		maxMovePower
		zMovePower
		isFieldMove
	}

	query getMoveDetails($move: String!) {
		getMoveDetailsByFuzzy(move: $move, skip: 0, take: 1) {
			...moves
		}
	}
`;

export const getTypeMatchup = gql`
	fragment typeEntry on TypeEntry {
		doubleEffectiveTypes
		effectiveTypes
		normalTypes
		resistedTypes
		doubleResistedTypes
		effectlessTypes
	}

	fragment typesMatchups on TypeMatchups {
		attacking {
			...typeEntry
		}
		defending {
			...typeEntry
		}
	}

	query getTypeMatchups($types: [Types!]!) {
		getTypeMatchup(types: $types) {
			...typesMatchups
		}
	}
`;

export const POKEMON_GRAPHQL_API_URL = ENABLE_LOCAL_POKEDEX ? 'http://localhost:4000' : 'https://graphqlpokemon.favware.tech';

export async function fetchGraphQLPokemon<R extends PokemonQueryReturnTypes>(query: string, variables: PokemonQueryVariables<R>) {
	try {
		return fetch<PokemonResponse<R>>(
			POKEMON_GRAPHQL_API_URL,
			{
				method: FetchMethods.Post,
				headers: {
					'Content-Type': Mime.Types.ApplicationJson
				},
				body: JSON.stringify({
					query,
					variables
				})
			},
			FetchResultTypes.JSON
		);
	} catch {
		// No need to throw anything specific here, it is caught off in the commands' fetchAPI method.
		throw 'query_failed';
	}
}

/**
 * Parses a Bulbapedia-like URL to be properly embeddable on Discord
 * @param url URL to parse
 */
export const parseBulbapediaURL = (url: string) => url.replace(/[ ]/g, '_').replace(/\(/g, '%28').replace(/\)/g, '%29');

/** Parses PokéDex colours to Discord MessageEmbed colours */
export const resolveColour = (col: string) => {
	switch (col) {
		case 'Black':
			return 0x323232;
		case 'Blue':
			return 0x257cff;
		case 'Brown':
			return 0xa3501a;
		case 'Gray':
			return 0x969696;
		case 'Green':
			return 0x3eff4e;
		case 'Pink':
			return 0xff65a5;
		case 'Purple':
			return 0xa63de8;
		case 'Red':
			return 0xff3232;
		case 'White':
			return 0xe1e1e1;
		case 'Yellow':
			return 0xfff359;
		default:
			return 0xff0000;
	}
};

export interface PokemonResponse<K extends keyof Omit<Query, '__typename'>> {
	data: Record<K, Omit<Query[K], '__typename'>>;
}

export type PokemonQueryReturnTypes = keyof Pick<
	Query,
	| 'getAbilityDetailsByFuzzy'
	| 'getItemDetailsByFuzzy'
	| 'getMoveDetailsByFuzzy'
	| 'getPokemonDetailsByFuzzy'
	| 'getPokemonLearnsetByFuzzy'
	| 'getTypeMatchup'
>;

type PokemonQueryVariables<R extends PokemonQueryReturnTypes> = R extends 'getAbilityDetailsByFuzzy'
	? QueryGetAbilityDetailsByFuzzyArgs
	: R extends 'getItemDetailsByFuzzy'
	? QueryGetItemDetailsByFuzzyArgs
	: R extends 'getMoveDetailsByFuzzy'
	? QueryGetMoveDetailsByFuzzyArgs
	: R extends 'getPokemonDetailsByFuzzy'
	? QueryGetPokemonDetailsByFuzzyArgs
	: R extends 'getPokemonLearnsetByFuzzy'
	? QueryGetPokemonLearnsetByFuzzyArgs
	: R extends 'getTypeMatchup'
	? QueryGetTypeMatchupArgs
	: never;
