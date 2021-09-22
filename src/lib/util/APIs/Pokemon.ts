import { envParseString } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type {
	Query,
	QueryGetFuzzyAbilityArgs,
	QueryGetFuzzyItemArgs,
	QueryGetFuzzyLearnsetArgs,
	QueryGetFuzzyMoveArgs,
	QueryGetFuzzyPokemonArgs,
	QueryGetTypeMatchupArgs
} from '@favware/graphql-pokemon';
import { fetch, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { UserError } from '@sapphire/framework';
import { MimeTypes } from '@sapphire/plugin-api';
import { gql } from '../util';
export const getFuzzyPokemon = (params: GetPokemonSpriteParameters) => {
	const spriteToGet = getSpriteKey(params);

	return gql`
		fragment flavors on Flavor {
			game
			flavor
		}

		fragment abilities on Abilities {
			first
			second
			hidden
			special
		}

		fragment stats on Stats {
			hp
			attack
			defense
			specialattack
			specialdefense
			speed
		}

		fragment evYields on EvYields {
			hp
			attack
			defense
			specialattack
			specialdefense
			speed
		}

		fragment genders on Gender {
			male
			female
		}

		fragment pokemon on Pokemon {
			num
			species
			types
			evYields {
				...evYields
			}
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
			${spriteToGet}
			smogonTier
			bulbapediaPage
			serebiiPage
			smogonPage
			isEggObtainable
			minimumHatchTime
			maximumHatchTime
			levellingRate
			catchRate { base percentageWithOrdinaryPokeballAtFullHealth }
			flavorTexts {
				...flavors
			}
		}

		fragment evolutionsData on Pokemon {
			species
			evolutionLevel
		}

		fragment evolutions on Pokemon {
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

		query getFuzzyPokemon($pokemon: String!) {
			getFuzzyPokemon(pokemon: $pokemon, takeFlavorTexts: 2) {
				...pokemon
				...evolutions
			}
		}
`;
};

export const getFuzzyFlavorTexts = (params: GetPokemonSpriteParameters) => {
	const spriteToGet = getSpriteKey(params);

	return gql`
		query getFuzzyPokemon($pokemon: String!) {
			getFuzzyPokemon(pokemon: $pokemon, takeFlavorTexts: 50) {
				${spriteToGet}
				num
				species
				color
				flavorTexts {
					game
					flavor
				}
			}
		}
`;
};

export const getFuzzyAbility = gql`
	query getFuzzyAbility($ability: String!) {
		getFuzzyAbility(ability: $ability) {
			desc
			shortDesc
			name
			isFieldAbility
			bulbapediaPage
			serebiiPage
			smogonPage
		}
	}
`;

export const getFuzzyItem = gql`
	query getFuzzyItem($item: String!) {
		getFuzzyItem(item: $item) {
			desc
			name
			bulbapediaPage
			serebiiPage
			smogonPage
			sprite
			isNonstandard
			generationIntroduced
		}
	}
`;

export const getFuzzyLearnset = (params: GetPokemonSpriteParameters) => {
	const spriteToGet = getSpriteKey(params);

	return gql`
		fragment learnsetLevelupMove on LearnsetLevelUpMove {
			name
			generation
			level
		}

		fragment learnsetMove on LearnsetMove {
			name
			generation
		}

		fragment learnset on Learnset {
			num
			species
			${spriteToGet}
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

		query getFuzzyLearnset($pokemon: String!, $moves: [String!]!, $generation: Int) {
			getFuzzyLearnset(pokemon: $pokemon, moves: $moves, generation: $generation) {
				...learnset
			}
		}
`;
};

export const getFuzzyMove = gql`
	query getFuzzyMove($move: String!) {
		getFuzzyMove(move: $move) {
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
	}
`;

export const getTypeMatchup = gql`
	fragment type on Type {
		doubleEffectiveTypes
		effectiveTypes
		normalTypes
		resistedTypes
		doubleResistedTypes
		effectlessTypes
	}

	query getTypeMatchups($types: [TypesEnum!]!) {
		getTypeMatchup(types: $types) {
			attacking {
				...type
			}
			defending {
				...type
			}
		}
	}
`;

export const getPokemonSprite = (params: GetPokemonSpriteParameters) => {
	const spriteToGet = getSpriteKey(params);

	return gql`
		query getFuzzyPokemon($pokemon: String!) {
			getFuzzyPokemon(pokemon: $pokemon) {
				${spriteToGet}
			}
		}
`;
};

export const getSpriteKey = ({
	backSprite = false,
	shinySprite = false
}: GetPokemonSpriteParameters): 'sprite' | 'shinySprite' | 'backSprite' | 'shinyBackSprite' => {
	if (backSprite && shinySprite) return 'shinyBackSprite';
	if (backSprite) return 'backSprite';
	if (shinySprite) return 'shinySprite';

	return 'sprite';
};

export async function fetchGraphQLPokemon<R extends PokemonQueryReturnTypes>(
	query: string,
	variables: PokemonQueryVariables<R>
): Promise<PokemonResponse<R>> {
	try {
		return fetch<PokemonResponse<R>>(
			envParseString('GRAPHQL_POKEMON_URL'),
			{
				method: FetchMethods.Post,
				headers: {
					'Content-Type': MimeTypes.ApplicationJson
				},
				body: JSON.stringify({
					query,
					variables
				})
			},
			FetchResultTypes.JSON
		);
	} catch {
		throw new UserError({ identifier: LanguageKeys.System.QueryFail });
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

export interface GetPokemonSpriteParameters {
	backSprite?: boolean;
	shinySprite?: boolean;
}

export interface PokemonResponse<K extends keyof Omit<Query, '__typename'>> {
	data: Record<K, Omit<Query[K], '__typename'>>;
}

export type PokemonQueryReturnTypes = keyof Pick<
	Query,
	'getFuzzyAbility' | 'getFuzzyItem' | 'getFuzzyMove' | 'getFuzzyPokemon' | 'getFuzzyLearnset' | 'getTypeMatchup'
>;

type PokemonQueryVariables<R extends PokemonQueryReturnTypes> = R extends 'getFuzzyAbility'
	? QueryGetFuzzyAbilityArgs
	: R extends 'getFuzzyItem'
	? QueryGetFuzzyItemArgs
	: R extends 'getFuzzyMove'
	? QueryGetFuzzyMoveArgs
	: R extends 'getFuzzyPokemon'
	? QueryGetFuzzyPokemonArgs
	: R extends 'getFuzzyLearnset'
	? QueryGetFuzzyLearnsetArgs
	: R extends 'getTypeMatchup'
	? QueryGetTypeMatchupArgs
	: never;
