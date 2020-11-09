import { CustomGet, FT, T } from '@lib/types';
import { EightBallLanguage } from '@root/commands/Fun/8ball';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';
import { User } from 'discord.js';

export const ChangemymindDescription = T<string>('commandChangemymindDescription');
export const ChangemymindExtended = T<LanguageHelpDisplayOptions>('commandChangemymindExtended');
export const ChoiceDescription = T<string>('commandChoiceDescription');
export const ChoiceDuplicates = FT<{ words: string }, string>('commandChoiceDuplicates');
export const ChoiceExtended = T<LanguageHelpDisplayOptions>('commandChoiceExtended');
export const ChoiceMissing = T<string>('commandChoiceMissing');
export const ChoiceOutput = FT<{ user: string; word: string }, string>('commandChoiceOutput');
export const DiceDescription = T<string>('commandDiceDescription');
export const DiceExtended = T<LanguageHelpDisplayOptions>('commandDiceExtended');
export const DiceOutput = FT<{ result: number }, string>('commandDiceOutput');
export const DiceRollsError = T<string>('commandDiceRollsError');
export const DiceSidesError = T<string>('commandDiceSidesError');
export const EightballDescription = T<string>('command8ballDescription');
export const EightballElse = T<readonly string[]>('command8ballElse');
export const EightballExtended = T<LanguageHelpDisplayOptions>('command8ballExtended');
export const EightballHowMany = T<readonly string[]>('command8ballHowMany');
export const EightballHowMuch = T<readonly string[]>('command8ballHowMuch');
export const EightballOutput = FT<{ author: string; question: string; response: string }, string>('command8ballOutput');
export const EightballQuestions = T<EightBallLanguage>('command8ballQuestions');
export const EightballWhat = T<readonly string[]>('command8ballWhat');
export const EightballWhen = T<readonly string[]>('command8ballWhen');
export const EightballWho = T<readonly string[]>('command8ballWho');
export const EightballWhy = T<readonly string[]>('command8ballWhy');
export const EscaperopeDescription = T<string>('commandEscaperopeDescription');
export const EscaperopeExtended = T<LanguageHelpDisplayOptions>('commandEscaperopeExtended');
export const EscaperopeOutput = FT<{ user: string }, string>('commandEscaperopeOutput');
export const HowToFlirtDescription = T<string>('commandHowToFlirtDescription');
export const HowToFlirtExtended = T<LanguageHelpDisplayOptions>('commandHowToFlirtExtended');
export const Love100 = T<string>('commandLove100');
export const LoveDescription = T<string>('commandLoveDescription');
export const LoveExtended = T<LanguageHelpDisplayOptions>('commandLoveExtended');
export const LoveItself = T<string>('commandLoveItself');
export const LoveLess100 = T<string>('commandLoveLess100');
export const LoveLess45 = T<string>('commandLoveLess45');
export const LoveLess75 = T<string>('commandLoveLess75');
export const LoveResult = T<string>('commandLoveResult');
export const MarkovDescription = T<string>('commandMarkovDescription');
export const MarkovExtended = T<LanguageHelpDisplayOptions>('commandMarkovExtended');
export const MarkovNoMessages = T<string>('commandMarkovNoMessages');
export const MarkovTimer = FT<{ timer: string }, string>('commandMarkovTimer');
export const NorrisDescription = T<string>('commandNorrisDescription');
export const NorrisExtended = T<LanguageHelpDisplayOptions>('commandNorrisExtended');
export const NorrisOutput = T<string>('commandNorrisOutput');
export const PeepoloveDescription = T<string>('commandPeepoloveDescription');
export const PeepoloveExtended = T<LanguageHelpDisplayOptions>('commandPeepoloveExtended');
export const PunDescription = T<string>('commandPunDescription');
export const PunError = T<string>('commandPunError');
export const PunExtended = T<LanguageHelpDisplayOptions>('commandPunExtended');
export const RateDescription = T<string>('commandRateDescription');
export const RateExtended = T<LanguageHelpDisplayOptions>('commandRateExtended');
export const RateMyself = T<[string, string]>('commandRateMyself');
export const RateOutput = FT<{ author: string; userToRate: string; rate: number; emoji: string }, string>('commandRateOutput');
export const ShindeiruDescription = T<string>('commandShindeiruDescription');
export const ShindeiruExtended = T<LanguageHelpDisplayOptions>('commandShindeiruExtended');
export const WakandaDescription = T<string>('commandWakandaDescription');
export const WakandaExtended = T<LanguageHelpDisplayOptions>('commandWakandaExtended');
export const XkcdComics = FT<{ amount: number }, string>('commandXkcdComics');
export const XkcdDescription = T<string>('commandXkcdDescription');
export const XkcdExtended = T<LanguageHelpDisplayOptions>('commandXkcdExtended');
export const XkcdNotfound = T<string>('commandXkcdNotfound');

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
