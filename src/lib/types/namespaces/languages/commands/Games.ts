import { T } from '@lib/types/Shared';
import { HungerGamesGame } from '@root/commands/Games/hungergames';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const GamesSkyra = T<string>('commandGamesSkyra');
export const GamesBot = T<string>('commandGamesBot');
export const GamesSelf = T<string>('commandGamesSelf');
export const GamesProgress = T<string>('commandGamesProgress');
export const GamesNoPlayers = T<(params: { prefix: string }) => string>('commandGamesNoPlayers');
export const GamesTooManyOrFew = T<(params: { min: number; max: number }) => string>('commandGamesTooManyOrFew');
export const GamesRepeat = T<string>('commandGamesRepeat');
export const GamesPromptTimeout = T<string>('commandGamesPromptTimeout');
export const GamesPromptDeny = T<string>('commandGamesPromptDeny');
export const GamesTimeout = T<string>('commandGamesTimeout');
export const C4Description = T<string>('commandC4Description');
export const C4Extended = T<LanguageHelpDisplayOptions>('commandC4Extended');
export const C4Prompt = T<(params: { challenger: string; challengee: string }) => string>('commandC4Prompt');
export const C4Start = T<(params: { player: string }) => string>('commandC4Start');
export const C4GameColumnFull = T<string>('commandC4GameColumnFull');
export const C4GameWin = T<(params: { user: string }) => string>('commandC4GameWin');
export const C4GameWinTurn0 = T<(params: { user: string }) => string>('commandC4GameWinTurn0');
export const C4GameDraw = T<string>('commandC4GameDraw');
export const C4GameNext = T<(params: { user: string }) => string>('commandC4GameNext');
export const C4GameNextTurn0 = T<(params: { user: string }) => string>('commandC4GameNextTurn0');
export const CoinFlipDescription = T<string>('commandCoinFlipDescription');
export const CoinFlipExtended = T<LanguageHelpDisplayOptions>('commandCoinFlipExtended');
export const CoinFlipInvalidCoinname = T<(params: { arg: string }) => string>('commandCoinFlipInvalidCoinname');
export const CoinFlipCoinnames = T<string[]>('commandCoinFlipCoinnames');
export const CoinFlipWinTitle = T<string>('commandCoinFlipWinTitle');
export const CoinFlipLoseTitle = T<string>('commandCoinFlipLoseTitle');
export const CoinFlipNoguessTitle = T<string>('commandCoinFlipNoguessTitle');
export const CoinFlipWinDescription = T<(params: { result: string }) => string>('commandCoinFlipWinDescription');
export const CoinFlipWinDescriptionWithWager = T<(params: { result: string; wager: number }) => string>('commandCoinFlipWinDescriptionWithWager');
export const CoinFlipLoseDescription = T<(params: { result: string }) => string>('commandCoinFlipLoseDescription');
export const CoinFlipLoseDescriptionWithWager = T<(params: { result: string; wager: number }) => string>('commandCoinFlipLoseDescriptionWithWager');
export const CoinFlipNoguessDescription = T<(params: { result: string }) => string>('commandCoinFlipNoguessDescription');
export const HigherLowerDescription = T<string>('commandHigherLowerDescription');
export const HigherLowerExtended = T<LanguageHelpDisplayOptions>('commandHigherLowerExtended');
export const HigherLowerLoading = T<string>('commandHigherLowerLoading');
export const HigherLowerNewround = T<string>('commandHigherLowerNewround');
export const HigherLowerEmbed = T<
	(params: {
		turn: number;
		number: number;
	}) => {
		title: string;
		description: string;
		footer: string;
	}
>('commandHigherLowerEmbed');
export const HigherLowerLose = T<
	(params: {
		number: number;
		losses: number;
	}) => {
		title: string;
		description: string;
		footer: string;
	}
>('commandHigherLowerLose');
export const HigherLowerWin = T<
	(params: {
		potentials: number;
		number: number;
	}) => {
		title: string;
		description: string;
		footer: string;
	}
>('commandHigherLowerWin');
export const HigherLowerCancel = T<
	(params: {
		username: string;
	}) => {
		title: string;
		description: string;
	}
>('commandHigherLowerCancel');
export const HigherLowerCashout = T<(params: { amount: number }) => string>('commandHigherLowerCashout');
export const HungerGamesDescription = T<string>('commandHungerGamesDescription');
export const HungerGamesExtended = T<LanguageHelpDisplayOptions>('commandHungerGamesExtended');
export const HungerGamesResultHeaderBloodbath = T<(params: { game: HungerGamesGame }) => string>('commandHungerGamesResultHeaderBloodbath');
export const HungerGamesResultHeaderSun = T<(params: { game: HungerGamesGame }) => string>('commandHungerGamesResultHeaderSun');
export const HungerGamesResultHeaderMoon = T<(params: { game: HungerGamesGame }) => string>('commandHungerGamesResultHeaderMoon');
export const HungerGamesResultDeaths = T<(params: { deaths: number }) => string>('commandHungerGamesResultDeaths');
export const HungerGamesResultDeathsPlural = T<(params: { deaths: number }) => string>('commandHungerGamesResultDeathsPlural');
export const HungerGamesResultProceed = T<string>('commandHungerGamesResultProceed');
export const HungerGamesStop = T<string>('commandHungerGamesStop');
export const HungerGamesWinner = T<(params: { winner: string }) => string>('commandHungerGamesWinner');
export const HungerGamesBloodbath = T<readonly string[]>('hgBloodbath');
export const HungerGamesDay = T<readonly string[]>('hgDay');
export const HungerGamesNight = T<readonly string[]>('hgNight');
export const SlotmachineDescription = T<string>('commandSlotmachineDescription');
export const SlotmachineExtended = T<LanguageHelpDisplayOptions>('commandSlotmachineExtended');
export const SlotmachinesWin = T<(params: { roll: string; winnings: number }) => string>('commandSlotmachinesWin');
export const SlotmachinesLoss = T<(params: { roll: string }) => string>('commandSlotmachinesLoss');
export const SlotmachineTitles = T<{
	previous: string;
	new: string;
}>('commandSlotmachineTitles');
export const SlotmachineCanvasTextWon = T<string>('commandSlotmachineCanvasTextWon');
export const SlotmachineCanvasTextLost = T<string>('commandSlotmachineCanvasTextLost');
export const TicTacToeDescription = T<string>('commandTicTacToeDescription');
export const TicTacToeExtended = T<LanguageHelpDisplayOptions>('commandTicTacToeExtended');
export const WheelOfFortuneDescription = T<string>('commandWheelOfFortuneDescription');
export const WheelOfFortuneExtended = T<LanguageHelpDisplayOptions>('commandWheelOfFortuneExtended');
export const WheelOfFortuneCanvasTextWon = T<string>('commandWheelOfFortuneCanvasTextWon');
export const WheelOfFortuneCanvasTextLost = T<string>('commandWheelOfFortuneCanvasTextLost');
export const WheelOfFortuneTitles = T<{
	previous: string;
	new: string;
}>('commandWheelOfFortuneTitles');
export const TicTacToePrompt = T<(params: { challenger: string; challengee: string }) => string>('commandTicTacToePrompt');
export const TicTacToeTurn = T<(params: { icon: string; player: string; board: string }) => string>('commandTicTacToeTurn');
export const TicTacToeWinner = T<(params: { winner: string; board: string }) => string>('commandTicTacToeWinner');
export const TicTacToeDraw = T<(params: { board: string }) => string>('commandTicTacToeDraw');
export const TriviaDescription = T<string>('commandTriviaDescription');
export const TriviaExtended = T<LanguageHelpDisplayOptions>('commandTriviaExtended');
export const TriviaInvalidCategory = T<string>('commandTriviaInvalidCategory');
export const TriviaActiveGame = T<string>('commandTriviaActiveGame');
export const TriviaIncorrect = T<(params: { attempt: string }) => string>('commandTriviaIncorrect');
export const TriviaNoAnswer = T<(params: { correctAnswer: string }) => string>('commandTriviaNoAnswer');
export const TriviaEmbedTitles = T<{
	trivia: string;
	difficulty: string;
}>('commandTriviaEmbedTitles');
export const TriviaWinner = T<(params: { winner: string; correctAnswer: string }) => string>('commandTriviaWinner');
