import { FT, T } from '#lib/types';
import { HungerGamesGame } from '#root/commands/Games/hungergames';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const GamesSkyra = T<string>('commandGamesSkyra');
export const GamesBot = T<string>('commandGamesBot');
export const GamesSelf = T<string>('commandGamesSelf');
export const GamesProgress = T<string>('commandGamesProgress');
export const GamesNoPlayers = FT<{ prefix: string }, string>('commandGamesNoPlayers');
export const GamesTooManyOrFew = FT<{ min: number; max: number }, string>('commandGamesTooManyOrFew');
export const GamesRepeat = T<string>('commandGamesRepeat');
export const GamesPromptTimeout = T<string>('commandGamesPromptTimeout');
export const GamesPromptDeny = T<string>('commandGamesPromptDeny');
export const GamesTimeout = T<string>('commandGamesTimeout');
export const GamesCannotHaveNegativeMoney = T<string>('gamesCannotHaveNegativeMoney');
export const GamesNotEnoughMoney = FT<{ money: number }, string>('gamesNotEnoughMoney');
export const C4Description = T<string>('commandC4Description');
export const C4Extended = T<LanguageHelpDisplayOptions>('commandC4Extended');
export const C4Prompt = FT<{ challenger: string; challengee: string }, string>('commandC4Prompt');
export const C4Start = FT<{ player: string }, string>('commandC4Start');
export const C4GameColumnFull = T<string>('commandC4GameColumnFull');
export const C4GameWin = FT<{ user: string }, string>('commandC4GameWin');
export const C4GameWinTurn0 = FT<{ user: string }, string>('commandC4GameWinTurn0');
export const C4GameDraw = T<string>('commandC4GameDraw');
export const C4GameNext = FT<{ user: string }, string>('commandC4GameNext');
export const C4GameNextTurn0 = FT<{ user: string }, string>('commandC4GameNextTurn0');
export const CoinFlipDescription = T<string>('commandCoinFlipDescription');
export const CoinFlipExtended = T<LanguageHelpDisplayOptions>('commandCoinFlipExtended');
export const CoinFlipInvalidCoinname = FT<{ arg: string }, string>('commandCoinFlipInvalidCoinname');
export const CoinFlipCoinNames = T<string[]>('commandCoinFlipCoinnames');
export const CoinFlipWinTitle = T<string>('commandCoinFlipWinTitle');
export const CoinFlipLoseTitle = T<string>('commandCoinFlipLoseTitle');
export const CoinFlipNoGuessTitle = T<string>('commandCoinFlipNoguessTitle');
export const CoinFlipWinDescription = FT<{ result: string }, string>('commandCoinFlipWinDescription');
export const CoinFlipWinDescriptionWithWager = FT<{ result: string; wager: number }, string>('commandCoinFlipWinDescriptionWithWager');
export const CoinFlipLoseDescription = FT<{ result: string }, string>('commandCoinFlipLoseDescription');
export const CoinFlipLoseDescriptionWithWager = FT<{ result: string; wager: number }, string>('commandCoinFlipLoseDescriptionWithWager');
export const CoinFlipNoGuessDescription = FT<{ result: string }, string>('commandCoinFlipNoguessDescription');
export const HigherLowerDescription = T<string>('commandHigherLowerDescription');
export const HigherLowerExtended = T<LanguageHelpDisplayOptions>('commandHigherLowerExtended');
export const HigherLowerLoading = T<string>('commandHigherLowerLoading');
export const HigherLowerNewround = T<string>('commandHigherLowerNewround');
export const HigherLowerEmbed = FT<
	{
		turn: number;
		number: number;
	},
	{
		title: string;
		description: string;
		footer: string;
	}
>('commandHigherLowerEmbed');
export const HigherLowerLose = FT<
	{
		number: number;
		losses: number;
	},
	{
		title: string;
		description: string;
		footer: string;
	}
>('commandHigherLowerLose');
export const HigherLowerWin = FT<
	{
		potentials: number;
		number: number;
	},
	{
		title: string;
		description: string;
		footer: string;
	}
>('commandHigherLowerWin');
export const HigherLowerCancel = FT<
	{
		username: string;
	},
	{
		title: string;
		description: string;
	}
>('commandHigherLowerCancel');
export const HigherLowerCashout = FT<{ amount: number }, string>('commandHigherLowerCashout');
export const HungerGamesDescription = T<string>('commandHungerGamesDescription');
export const HungerGamesExtended = T<LanguageHelpDisplayOptions>('commandHungerGamesExtended');
export const HungerGamesResultHeaderBloodbath = FT<{ game: HungerGamesGame }, string>('commandHungerGamesResultHeaderBloodbath');
export const HungerGamesResultHeaderSun = FT<{ game: HungerGamesGame }, string>('commandHungerGamesResultHeaderSun');
export const HungerGamesResultHeaderMoon = FT<{ game: HungerGamesGame }, string>('commandHungerGamesResultHeaderMoon');
export const HungerGamesResultDeaths = FT<{ deaths: number }, string>('commandHungerGamesResultDeaths');
export const HungerGamesResultDeathsPlural = FT<{ deaths: number }, string>('commandHungerGamesResultDeathsPlural');
export const HungerGamesResultProceed = T<string>('commandHungerGamesResultProceed');
export const HungerGamesStop = T<string>('commandHungerGamesStop');
export const HungerGamesWinner = FT<{ winner: string }, string>('commandHungerGamesWinner');
export const HungerGamesBloodbath = T<readonly string[]>('hgBloodbath');
export const HungerGamesDay = T<readonly string[]>('hgDay');
export const HungerGamesNight = T<readonly string[]>('hgNight');
export const SlotmachineDescription = T<string>('commandSlotmachineDescription');
export const SlotmachineExtended = T<LanguageHelpDisplayOptions>('commandSlotmachineExtended');
export const SlotmachinesWin = FT<{ roll: string; winnings: number }, string>('commandSlotmachinesWin');
export const SlotmachinesLoss = FT<{ roll: string }, string>('commandSlotmachinesLoss');
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
export const TicTacToePrompt = FT<{ challenger: string; challengee: string }, string>('commandTicTacToePrompt');
export const TicTacToeTurn = FT<{ icon: string; player: string; board: string }, string>('commandTicTacToeTurn');
export const TicTacToeWinner = FT<{ winner: string; board: string }, string>('commandTicTacToeWinner');
export const TicTacToeDraw = FT<{ board: string }, string>('commandTicTacToeDraw');
export const TriviaDescription = T<string>('commandTriviaDescription');
export const TriviaExtended = T<LanguageHelpDisplayOptions>('commandTriviaExtended');
export const TriviaInvalidCategory = T<string>('commandTriviaInvalidCategory');
export const TriviaActiveGame = T<string>('commandTriviaActiveGame');
export const TriviaIncorrect = FT<{ attempt: string }, string>('commandTriviaIncorrect');
export const TriviaNoAnswer = FT<{ correctAnswer: string }, string>('commandTriviaNoAnswer');
export const TriviaEmbedTitles = T<{
	trivia: string;
	difficulty: string;
}>('commandTriviaEmbedTitles');
export const TriviaWinner = FT<{ winner: string; correctAnswer: string }, string>('commandTriviaWinner');
