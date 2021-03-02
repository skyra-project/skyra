import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { CustomGet, FT, T } from '#lib/types';
import type { EightBallLanguage } from '#root/commands/Fun/8ball';

export const ChangeMyMindDescription = T<string>('commands/fun:changemymindDescription');
export const ChangeMyMindExtended = T<LanguageHelpDisplayOptions>('commands/fun:changemymindExtended');
export const ChoiceDescription = T<string>('commands/fun:choiceDescription');
export const ChoiceDuplicates = FT<{ words: string }, string>('commands/fun:choiceDuplicates');
export const ChoiceExtended = T<LanguageHelpDisplayOptions>('commands/fun:choiceExtended');
export const ChoiceMissing = T<string>('commands/fun:choiceMissing');
export const ChoiceOutput = FT<{ user: string; word: string }, string>('commands/fun:choiceOutput');
export const DiceDescription = T<string>('commands/fun:diceDescription');
export const DiceExtended = T<LanguageHelpDisplayOptions>('commands/fun:diceExtended');
export const DiceOutput = FT<{ result: number }, string>('commands/fun:diceOutput');
export const DiceRollsError = T<string>('commands/fun:diceRollsError');
export const DiceSidesError = T<string>('commands/fun:diceSidesError');
export const EightballDescription = T<string>('commands/fun:8ballDescription');
export const EightballElse = T<readonly string[]>('commands/fun:8ballElse');
export const EightballExtended = T<LanguageHelpDisplayOptions>('commands/fun:8ballExtended');
export const EightballHowMany = T<readonly string[]>('commands/fun:8ballHowMany');
export const EightballHowMuch = T<readonly string[]>('commands/fun:8ballHowMuch');
export const EightballOutput = FT<{ author: string; question: string; response: string }, string>('commands/fun:8ballOutput');
export const EightballQuestions = T<EightBallLanguage>('commands/fun:8ballQuestions');
export const EightballWhat = T<readonly string[]>('commands/fun:8ballWhat');
export const EightballWhen = T<readonly string[]>('commands/fun:8ballWhen');
export const EightballWho = T<readonly string[]>('commands/fun:8ballWho');
export const EightballWhy = T<readonly string[]>('commands/fun:8ballWhy');
export const EscapeRopeDescription = T<string>('commands/fun:escaperopeDescription');
export const EscapeRopeExtended = T<LanguageHelpDisplayOptions>('commands/fun:escaperopeExtended');
export const EscapeRopeOutput = FT<{ user: string }, string>('commands/fun:escaperopeOutput');
export const HowToFlirtDescription = T<string>('commands/fun:howToFlirtDescription');
export const HowToFlirtExtended = T<LanguageHelpDisplayOptions>('commands/fun:howToFlirtExtended');
export const Love100 = T<string>('commands/fun:love100');
export const LoveDescription = T<string>('commands/fun:loveDescription');
export const LoveExtended = T<LanguageHelpDisplayOptions>('commands/fun:loveExtended');
export const LoveItself = T<string>('commands/fun:loveItself');
export const LoveLess100 = T<string>('commands/fun:loveLess100');
export const LoveLess45 = T<string>('commands/fun:loveLess45');
export const LoveLess75 = T<string>('commands/fun:loveLess75');
export const LoveResult = T<string>('commands/fun:loveResult');
export const MarkovDescription = T<string>('commands/fun:markovDescription');
export const MarkovExtended = T<LanguageHelpDisplayOptions>('commands/fun:markovExtended');
export const MarkovNsfwChannel = FT<{ channel: string }, string>('commands/fun:markovNsfwChannel');
export const MarkovNoMessages = T<string>('commands/fun:markovNoMessages');
export const MarkovTimer = FT<{ timer: string }, string>('commands/fun:markovTimer');
export const NorrisDescription = T<string>('commands/fun:norrisDescription');
export const NorrisExtended = T<LanguageHelpDisplayOptions>('commands/fun:norrisExtended');
export const NorrisOutput = T<string>('commands/fun:norrisOutput');
export const PeepoLoveDescription = T<string>('commands/fun:peepoloveDescription');
export const PeepoLoveExtended = T<LanguageHelpDisplayOptions>('commands/fun:peepoloveExtended');
export const PunDescription = T<string>('commands/fun:punDescription');
export const PunError = T<string>('commands/fun:punError');
export const PunExtended = T<LanguageHelpDisplayOptions>('commands/fun:punExtended');
export const RateDescription = T<string>('commands/fun:rateDescription');
export const RateExtended = T<LanguageHelpDisplayOptions>('commands/fun:rateExtended');
export const RateMyOwners = T<[string, string]>('commands/fun:rateOwners');
export const RateMyself = T<[string, string]>('commands/fun:rateMyself');
export const RateOutput = FT<{ author: string; userToRate: string; rate: number; emoji: string }, string>('commands/fun:rateOutput');
export const ShindeiruDescription = T<string>('commands/fun:shindeiruDescription');
export const ShindeiruExtended = T<LanguageHelpDisplayOptions>('commands/fun:shindeiruExtended');
export const WakandaDescription = T<string>('commands/fun:wakandaDescription');
export const WakandaExtended = T<LanguageHelpDisplayOptions>('commands/fun:wakandaExtended');
export const XkcdComics = FT<{ amount: number }, string>('commands/fun:xkcdComics');
export const XkcdDescription = T<string>('commands/fun:xkcdDescription');
export const XkcdExtended = T<LanguageHelpDisplayOptions>('commands/fun:xkcdExtended');
export const XkcdNotFound = T<string>('commands/fun:xkcdNotfound');

export const Resolve8BallQuestionKey = (key: keyof EightBallLanguage): CustomGet<string, readonly string[]> => {
	switch (key) {
		case 'HowMany':
			return EightballHowMany;
		case 'HowMuch':
			return EightballHowMuch;
		case 'What':
			return EightballWhat;
		case 'When':
			return EightballWhen;
		case 'Who':
			return EightballWho;
		case 'Why':
			return EightballWhy;
		default:
			return EightballElse;
	}
};
