import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const DragoniteReminder = T('commands/pokemon:dragoniteReminder');
export const AbilityDescription = T('commands/pokemon:abilityDescription');
export const AbilityExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:abilityExtended');
export const AbilityEmbedTitles = T<{ authorTitle: string; fieldEffectTitle: string }>('commands/pokemon:abilityEmbedTitles');
export const AbilityQueryFail = FT<{ ability: string }>('commands/pokemon:abilityQueryFail');
export const FlavorsDescription = T('commands/pokemon:flavorsDescription');
export const FlavorsExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:flavorsExtended');
export const FlavorsQueryFail = FT<{ pokemon: string }>('commands/pokemon:flavorsQueryFail');
export const FlavorNoFlavors = FT<{ pokemon: string }>('commands/pokemon:flavorNoFlavors');
export const ItemDescription = T('commands/pokemon:itemDescription');
export const ItemExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:itemExtended');
export const ItemEmbedData = FT<
	{ availableInGen8: string },
	{ ITEM: string; generationIntroduced: string; availableInGeneration8Title: string; availableInGeneration8Data: string }
>('commands/pokemon:itemEmbedData');
export const ItemQueryFail = FT<{ item: string }>('commands/pokemon:itemQueryFail');
export const LearnDescription = T('commands/pokemon:learnDescription');
export const LearnExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:learnExtended');
export const LearnMethodTypes = FT<{ level?: number | null }, LearnMethodTypesReturn>('commands/pokemon:learnMethodTypes');
export const LearnInvalidGeneration = FT<{ generation: string }>('commands/pokemon:learnInvalidGeneration');
export const LearnMethod = FT<{ generation: number; pokemon: string; move: string; method: string }>('commands/pokemon:learnMethod');
export const LearnQueryFailed = FT<{ pokemon: string; moves: string[] }>('commands/pokemon:learnQueryFailed');
export const LearnCannotLearn = FT<{ pokemon: string; moves: string[] }>('commands/pokemon:learnCannotLearn');
export const LearnTitle = FT<{ pokemon: string; generation: number }>('commands/pokemon:learnTitle');
export const MoveDescription = T('commands/pokemon:moveDescription');
export const MoveExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:moveExtended');
export const MoveEmbedData = FT<
	{ availableInGen8: string },
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
export const MoveQueryFail = FT<{ move: string }>('commands/pokemon:moveQueryFail');
export const PokedexDescription = T('commands/pokemon:pokedexDescription');
export const PokedexExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:pokedexExtended');
export const PokedexEmbedData = FT<{ otherFormes: readonly string[]; cosmeticFormes: readonly string[] }, PokedexEmbedDataReturn>(
	'commands/pokemon:pokedexEmbedData'
);
export const PokedexQueryFail = FT<{ pokemon: string }>('commands/pokemon:pokedexQueryFail');
export const SpriteDescription = T('commands/pokemon:spriteDescription');
export const SpriteExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:spriteExtended');
export const TypeDescription = T('commands/pokemon:typeDescription');
export const TypeExtended = T<LanguageHelpDisplayOptions>('commands/pokemon:typeExtended');
export const TypeEmbedData = FT<
	{ types: string[] },
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
export const TypeTooManyTypes = T('commands/pokemon:typeTooManyTypes');
export const TypeNotAType = FT<{ type: string }>('commands/pokemon:typeNotAType');
export const TypeQueryFail = FT<{ types: string[] }>('commands/pokemon:typeQueryFail');

export interface PokedexEmbedDataReturn {
	abilities: string;

	baseStats: string;

	baseStatsTotal: string;

	cosmeticFormesList: string;

	cosmeticFormesTitle: string;

	eggGroups: string;

	evolutionaryLine: string;

	evYields: string;

	flavourText: string;

	genderRatio: string;

	height: string;

	isEggObtainable: string;

	levellingRate: string;

	maximumHatchTime: string;

	minimumHatchingTime: string;

	otherFormesList: string;

	otherFormesTitle: string;

	smogonTier: string;

	types: string;

	uknownSmogonTier: string;

	weight: string;
}

export interface LearnMethodTypesReturn {
	dreamworldMoves: string;

	eggMoves: string;

	eventMoves: string;

	levelUpMoves: string;

	tmMoves: string;

	tutorMoves: string;

	virtualTransferMoves: string;
}
