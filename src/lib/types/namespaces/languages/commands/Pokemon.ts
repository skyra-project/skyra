import { FT, T } from '@lib/types';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const AbilityDescription = T<string>('commandAbilityDescription');
export const AbilityExtended = T<LanguageHelpDisplayOptions>('commandAbilityExtended');
export const AbilityEmbedTitle = T<string>('commandAbilityEmbedTitle');
export const AbilityQueryFail = FT<{ ability: string }, string>('commandAbilityQueryFail');
export const FlavorsDescription = T<string>('commandFlavorsDescription');
export const FlavorsExtended = T<LanguageHelpDisplayOptions>('commandFlavorsExtended');
export const FlavorsQueryFail = FT<{ pokemon: string }, string>('commandFlavorsQueryFail');
export const ItemDescription = T<string>('commandItemDescription');
export const ItemExtended = T<LanguageHelpDisplayOptions>('commandItemExtended');
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
>('commandItemEmbedData');
export const ItemQueryFail = FT<{ item: string }, string>('commandItemQueryFail');
export const LearnDescription = T<string>('commandLearnDescription');
export const LearnExtended = T<LanguageHelpDisplayOptions>('commandLearnExtended');
export const LearnMethodTypes = FT<{ level?: number | null }, LearnMethodTypesReturn>('commandLearnMethodTypes');
export const LearnInvalidGeneration = FT<{ generation: string }, string>('commandLearnInvalidGeneration');
export const LearnMethod = FT<{ generation: number; pokemon: string; move: string; method: string }, string>('commandLearnMethod');
export const LearnQueryFailed = FT<{ pokemon: string; moves: string }, string>('commandLearnQueryFailed');
export const LearnCannotLearn = FT<{ pokemon: string; moves: string }, string>('commandLearnCannotLearn');
export const LearnTitle = FT<{ pokemon: string; generation: number }, string>('commandLearnTitle');
export const MoveDescription = T<string>('commandMoveDescription');
export const MoveExtended = T<LanguageHelpDisplayOptions>('commandMoveExtended');
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
	}
>('commandMoveEmbedData');
export const MoveQueryFail = FT<{ move: string }, string>('commandMoveQueryFail');
export const PokedexDescription = T<string>('commandPokedexDescription');
export const PokedexExtended = T<LanguageHelpDisplayOptions>('commandPokedexExtended');
export const PokedexEmbedData = FT<{ otherFormes: readonly string[]; cosmeticFormes: readonly string[] }, PokedexEmbedDataReturn>(
	'commandPokedexEmbedData'
);
export const PokedexQueryFail = FT<{ pokemon: string }, string>('commandPokedexQueryFail');
export const TypeDescription = T<string>('commandTypeDescription');
export const TypeExtended = T<LanguageHelpDisplayOptions>('commandTypeExtended');
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
>('commandTypeEmbedData');
export const TypeTooManyTypes = T<string>('commandTypeTooManyTypes');
export const TypeNotAType = FT<{ type: string }, string>('commandTypeNotAType');
export const TypeQueryFail = FT<{ types: string }, string>('commandTypeQueryFail');

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
