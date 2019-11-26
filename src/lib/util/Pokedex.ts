import { Abilities, Items, Moves, Pokemon, Query, Types } from '@favware/graphql-pokemon';

const AbilityFragment = `
fragment ability on AbilityEntry {
    desc
    shortDesc
    name
    num
    bulbapediaPage
    serebiiPage
    smogonPage
}`;

const AbilitiesFragment = `
fragment abilities on AbilitiesEntry {
    first
    second
    hidden
    special
}`;

const StatsFragment = `
fragment stats on StatsEntry {
    hp
    attack
    defense
    specialattack
    specialdefense
    speed
}`;

const GendersFragment = `
fragment genders on GenderEntry {
  male
  female
}`;

const FlavorsFrament = `
fragment flavors on FlavorEntry {
  game
  flavor
}`;

const DexDetailsFragment = `
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

const EvolutionsFragment = `
${DexDetailsFragment}

fragment evolutions on DexDetails {
    evolutions {
        ...dexdetails
        evolutions {
          ...dexdetails
        }
      }
      preevolutions {
        ...dexdetails
        preevolutions {
          ...dexdetails
        }
      }
}`;

const ItemsFragment = `
fragment items on ItemEntry {
    desc
    shortDesc
    name
    num
    bulbapediaPage
    serebiiPage
    smogonPage
}`;

const LearnsetLevelupMoveFragment = `
fragment learnsetLevelupMove on LearnsetLevelUpMove {
    name
    generation
    level
}`;

const LearnsetMoveFragment = `
fragment learnsetMove on LearnsetMove {
    name
    generation
}`;

const LearnsetFragment = `
${LearnsetLevelupMoveFragment}
${LearnsetMoveFragment}

fragment learnset on LearnsetEntry {
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

const MoveFragment = `
fragment moves on MoveEntry {
    num
    name
    shortDesc
    type
    basePower
    pp
    accuracy
    priority
    target
    contestType
    bulbapediaPage
    serebiiPage
    smogonPage
    category
}`;

const TypeEntryFragment = `
fragment typeEntry on TypeEntry {
    doubleEffectiveTypes
    effectiveTypes
    normalTypes
    resistedTypes
    doubleResistedTypes
    effectlessTypes
}`;

const TypeMatchupFragment = `
${TypeEntryFragment}

fragment typesMatchups on TypeMatchups {
    attacking {
      ...typeEntry
    }
    defending {
      ...typeEntry
    }
}`;

export const getPokemonDetailsByFuzzy = (pokemon: string | Pokemon) => `
${EvolutionsFragment}

{
    getPokemonDetailsByFuzzy(pokemon: \"${pokemon}\" skip: 0 take: 1 reverse: true) {
        ...dexdetails
        ...evolutions
    }
}`;

export const getAbilityDetailsByFuzzy = (ability: string | Abilities) => `
${AbilityFragment}

{
    getAbilityDetailsByFuzzy(ability: \"${ability}\" skip: 0 take: 1) {
      ...ability
    }
}`;

export const getItemDetailsByFuzzy = (items: string | Items) => `
${ItemsFragment}

{
    getItemDetailsByFuzzy(item: \"${items}\" skip: 0 take: 1) {
        ...items
    }
}`;

export const getPokemonLearnset = (pokemon: Pokemon, moves: Moves[], generation?: PokemonGenerations) => `
${LearnsetFragment}

{
    getPokemonLearnset(pokemon: ${pokemon} moves: ${moves} generation: ${generation || 7}) {
      ...learnset
    }
}`;

export const getMoveDetailsByFuzzy = (move: string | Moves) => `
${MoveFragment}

{
    getMoveDetailsByFuzzy(move: \"${move}\" skip: 0 take: 1) {
        ...moves
    }
}`;

export const getTypeMatchup = (types: Types[]) => `
${TypeMatchupFragment}

{
    getMoveDetailsByFuzzy(types: ${types}) {
        ...typesMatchup
    }
}`;

/**
 * Parses a Bulbapedia-like URL to be properly embeddable on Discord
 * @param url URL to parse
 */
export const parseBulbapediaURL = (url: string) => url
	.replace(/[ ]/g, '_')
	.replace(/\(/g, '%28')
	.replace(/\)/g, '%29');

export interface GraphQLPokemonResponse<K extends keyof Omit<Query, '__typename'>> {
	data: Record<K, Omit<Query[K], '__typename'>>;
}

export type PokemonGenerations = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const POKEMON_GRAPHQL_API_URL = 'https://favware.tech/api';
export const POKEMON_EMBED_THUMBNAIL = 'https://cdn.skyra.pw/img/pokemon/dex.png';
