import { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const AbilityDescription = T<string>('commands/pokemon:abilityDescription');
export const AbilityExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:abilityExtended');
export const AbilityEmbedTitles = T<{ authorTitle: string; fieldEffectTitle: string }>('commands/pokemon:abilityEmbedTitles');
export const AbilityQueryFail = FT<{ ability: string }, string>('commands/pokemon:abilityQueryFail');
export const FlavorsDescription = T<string>('commands/pokemon:flavorsDescription');
export const FlavorsExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:flavorsExtended');
export const FlavorsQueryFail = FT<{ pokemon: string }, string>('commands/pokemon:flavorsQueryFail');
export const ItemDescription = T<string>('commands/pokemon:itemDescription');
export const ItemExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:itemExtended');
export const ItemEmbedData = FT<
	{
		availableInGen8: string;
	},
	{
		ITEM: string;
		generationIntroduced: string;
		availableInGeneration8Title: string;
		availableInGeneration8Data: string;
	}
>('commands/pokemon:itemEmbedData');
export const ItemQueryFail = FT<{ item: string }, string>('commands/pokemon:itemQueryFail');
export const LearnDescription = T<string>('commands/pokemon:learnDescription');
export const LearnExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:learnExtended');
export const LearnMethodTypes = FT<{ level?: number | null }, LearnMethodTypesReturn>('commands/pokemon:learnMethodTypes');
export const LearnInvalidGeneration = FT<{ generation: string }, string>('commands/pokemon:learnInvalidGeneration');
export const LearnMethod = FT<{ generation: number; pokemon: string; move: string; method: string }, string>('commands/pokemon:learnMethod');
export const LearnQueryFailed = FT<{ pokemon: string; moves: string[] }, string>('commands/pokemon:learnQueryFailed');
export const LearnCannotLearn = FT<{ pokemon: string; moves: string[] }, string>('commands/pokemon:learnCannotLearn');
export const LearnTitle = FT<{ pokemon: string; generation: number }, string>('commands/pokemon:learnTitle');
export const MoveDescription = T<string>('commands/pokemon:moveDescription');
export const MoveExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:moveExtended');
export const MoveEmbedData = FT<
	{
		availableInGen8: string;
	},
	{
		move: string;
		types: string;
		basePower: string;
		pp: string;
		category: string;
		accuracy: string;
		priority: string;
		target: string;
		contestCondition: string;
		zCrystal: string;
		gmaxPokemon: string;
		availableInGeneration8Title: string;
		availableInGeneration8Data: string;
		none: string;
		maxMovePower: string;
		zMovePower: string;
		fieldMoveEffectTitle: string;
	}
>('commands/pokemon:moveEmbedData');
export const MoveQueryFail = FT<{ move: string }, string>('commands/pokemon:moveQueryFail');
export const PokedexDescription = T<string>('commands/pokemon:pokedexDescription');
export const PokedexExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:pokedexExtended');
export const PokedexEmbedData = FT<{ otherFormes: readonly string[]; cosmeticFormes: readonly string[] }, PokedexEmbedDataReturn>(
	'commands/pokemon:pokedexEmbedData'
);
export const PokedexQueryFail = FT<{ pokemon: string }, string>('commands/pokemon:pokedexQueryFail');
export const TypeDescription = T<string>('commands/pokemon:typeDescription');
export const TypeExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:typeExtended');
export const TypeEmbedData = FT<
	{
		types: string[];
	},
	{
		offensive: string;
		defensive: string;
		superEffectiveAgainst: string;
		dealsNormalDamageTo: string;
		doesNotAffect: string;
		notVeryEffectiveAgainst: string;
		vulnerableTo: string;
		takesNormalDamageFrom: string;
		resists: string;
		notAffectedBy: string;
		typeEffectivenessFor: string;
	}
>('commands/pokemon:typeEmbedData');
export const TypeTooManyTypes = T<string>('commands/pokemon:typeTooManyTypes');
export const TypeNotAType = FT<{ type: string }, string>('commands/pokemon:typeNotAType');
export const TypeQueryFail = FT<{ types: string[] }, string>('commands/pokemon:typeQueryFail');

export interface PokedexEmbedDataReturn {
	types: string;
	abilities: string;
	genderRatio: string;
	smogonTier: string;
	uknownSmogonTier: string;
	height: string;
	weight: string;
	eggGroups: string;
	evolutionaryLine: string;
	baseStats: string;
	baseStatsTotal: string;
	flavourText: string;
	otherFormesTitle: string;
	cosmeticFormesTitle: string;
	otherFormesList: string;
	cosmeticFormesList: string;
}

export interface LearnMethodTypesReturn {
	levelUpMoves: string;
	eventMoves: string;
	tutorMoves: string;
	eggMoves: string;
	virtualTransferMoves: string;
	tmMoves: string;
	dreamworldMoves: string;
}
