import { Query, QueryGetAbilityDetailsByFuzzyArgs, QueryGetItemDetailsByFuzzyArgs, QueryGetMoveDetailsByFuzzyArgs, QueryGetPokemonDetailsByFuzzyArgs, QueryGetPokemonLearnsetByFuzzyArgs, QueryGetTypeMatchupArgs } from '@favware/graphql-pokemon';
import { ENABLE_LOCAL_POKEDEX } from '@root/config';
import { fetch, FetchMethods, FetchResultTypes } from './util';

const AbilityFragment = /* GraphQL */ `
fragment ability on AbilityEntry {
    desc
    shortDesc
    name
    bulbapediaPage
    serebiiPage
    smogonPage
}`;

const AbilitiesFragment = /* GraphQL */ `
fragment abilities on AbilitiesEntry {
    first
    second
    hidden
    special
}`;

const StatsFragment = /* GraphQL */ `
fragment stats on StatsEntry {
    hp
    attack
    defense
    specialattack
    specialdefense
    speed
}`;

const GendersFragment = /* GraphQL */ `
fragment genders on GenderEntry {
  male
  female
}`;

const FlavorsFrament = /* GraphQL */ `
fragment flavors on FlavorEntry {
  game
  flavor
}`;

const FlavorTextFragment = /* GraphQL */ `
${FlavorsFrament}
fragment flavortexts on DexDetails {
    flavorTexts {
        ...flavors
    }
}`;

const DexDetailsFragment = /* GraphQL */ `
${AbilitiesFragment}
${StatsFragment}
${GendersFragment}
${FlavorsFrament}

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
    sprite
    shinySprite
    smogonTier
    bulbapediaPage
    serebiiPage
    smogonPage
    flavorTexts {
        ...flavors
    }
}`;

const EvolutionsDataFragment = /* GraphQL */ `
fragment evolutionsData on DexDetails {
    species
    evolutionLevel
}`;

const EvolutionsFragment = /* GraphQL */ `
${DexDetailsFragment}
${EvolutionsDataFragment}

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
}`;

const ItemsFragment = /* GraphQL */ `
fragment items on ItemEntry {
    desc
    name
    bulbapediaPage
    serebiiPage
    smogonPage
    sprite
    isNonstandard
    generationIntroduced
}`;

const LearnsetLevelupMoveFragment = /* GraphQL */ `
fragment learnsetLevelupMove on LearnsetLevelUpMove {
    name
    generation
    level
}`;

const LearnsetMoveFragment = /* GraphQL */ `
fragment learnsetMove on LearnsetMove {
    name
    generation
}`;

const LearnsetFragment = /* GraphQL */ `
${LearnsetLevelupMoveFragment}
${LearnsetMoveFragment}

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
}`;

const MoveFragment = /* GraphQL */ `
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
}`;

const TypeEntryFragment = /* GraphQL */ `
fragment typeEntry on TypeEntry {
    doubleEffectiveTypes
    effectiveTypes
    normalTypes
    resistedTypes
    doubleResistedTypes
    effectlessTypes
}`;

const TypeMatchupFragment = /* GraphQL */ `
${TypeEntryFragment}

fragment typesMatchups on TypeMatchups {
    attacking {
      ...typeEntry
    }
    defending {
      ...typeEntry
    }
}`;

export const getPokemonDetailsByFuzzy = /* GraphQL */ `
${EvolutionsFragment}
query($pokemon: String!)  {
	getPokemonDetailsByFuzzy(pokemon: $pokemon skip: 0 take: 1 reverse: true) {
        ...dexdetails
        ...evolutions
    }
}`;

export const getPokemonFlavorTextsByFuzzy = /* GraphQL */ `
${FlavorTextFragment}

query($pokemon: String!) {
    getPokemonDetailsByFuzzy(pokemon: $pokemon skip: 0 reverse: true) {
        sprite
		shinySprite
		num
		species
		color
        ...flavortexts
    }
}`;

export const getAbilityDetailsByFuzzy = /* GraphQL */ `
${AbilityFragment}

query($ability: String!) {
  getAbilityDetailsByFuzzy(ability: $ability skip: 0 take: 1 ) {
    ...ability
  }
}`;

export const getItemDetailsByFuzzy = /* GraphQL */ `
${ItemsFragment}

query($item: String!) {
    getItemDetailsByFuzzy(item: $item skip: 0 take: 1) {
        ...items
    }
}`;

export const getPokemonLearnsetByFuzzy = /* GraphQL */`
${LearnsetFragment}

query($pokemon: String! $moves: [String!]! $generation: Int) {
    getPokemonLearnsetByFuzzy(pokemon: $pokemon moves: $moves generation: $generation) {
      ...learnset
    }
}`;

export const getMoveDetailsByFuzzy = /* GraphQL */ `
${MoveFragment}

query($move: String!) {
  getMoveDetailsByFuzzy(move: $move, skip: 0, take: 1) {
    ...moves
  }
}`;

export const getTypeMatchup = /* GraphQL */`
${TypeMatchupFragment}

query($types: [Types!]!) {
  getTypeMatchup(types: $types) {
    ...typesMatchups
  }
}`;

export const POKEMON_GRAPHQL_API_URL = ENABLE_LOCAL_POKEDEX ? 'http://localhost:4000' : 'https://favware.tech/api';
export const POKEMON_EMBED_THUMBNAIL = 'https://cdn.skyra.pw/img/pokemon/dex.png';

export async function fetchGraphQLPokemon<R extends GraphQLQueryReturnTypes>(query: string, variables: GraphQLQueryVariables<R>) {
	try {
		return fetch<GraphQLPokemonResponse<R>>(POKEMON_GRAPHQL_API_URL, {
			method: FetchMethods.Post,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query,
				variables
			})
		}, FetchResultTypes.JSON);
	} catch {
		// No need to throw anything specific here, it is caught off in the commands' fetchAPI method.
		throw 'query_failed';
	}
}

/**
 * Parses a Bulbapedia-like URL to be properly embeddable on Discord
 * @param url URL to parse
 */
export const parseBulbapediaURL = (url: string) => url
	.replace(/[ ]/g, '_')
	.replace(/\(/g, '%28')
	.replace(/\)/g, '%29');

/** Parses PokéDex colours to Discord MessageEmbed colours */
export const resolveColour = (col: string) => {
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
};

export interface GraphQLPokemonResponse<K extends keyof Omit<Query, '__typename'>> {
	data: Record<K, Omit<Query[K], '__typename'>>;
}

export type GraphQLQueryReturnTypes = keyof Pick<
Query,
| 'getAbilityDetailsByFuzzy'
| 'getItemDetailsByFuzzy'
| 'getMoveDetailsByFuzzy'
| 'getPokemonDetailsByFuzzy'
| 'getPokemonLearnsetByFuzzy'
| 'getTypeMatchup'
>;

type GraphQLQueryVariables<R extends GraphQLQueryReturnTypes> =
	R extends 'getAbilityDetailsByFuzzy'
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
