import { FT, T } from '#lib/types';
import { HungerGamesGame } from '#root/commands/Games/hungergames';
import { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';

export const BalanceDifference = FT<{ previous: string; next: string }, string>('commands/game:balanceDifference');
export const GamesSkyra = T<string>('commands/game:gamesSkyra');
export const GamesBot = T<string>('commands/game:gamesBot');
export const GamesSelf = T<string>('commands/game:gamesSelf');
export const GamesProgress = T<string>('commands/game:gamesProgress');
export const GamesNoPlayers = FT<{ prefix: string }, string>('commands/game:gamesNoPlayers');
export const GamesTooManyOrFew = FT<{ min: number; max: number }, string>('commands/game:gamesTooManyOrFew');
export const GamesRepeat = T<string>('commands/game:gamesRepeat');
export const GamesPromptTimeout = T<string>('commands/game:gamesPromptTimeout');
export const GamesPromptDeny = T<string>('commands/game:gamesPromptDeny');
export const GamesTimeout = T<string>('commands/game:gamesTimeout');
export const GamesCannotHaveNegativeMoney = T<string>('commands/game:cannotHaveNegativeMoney');
export const GamesNotEnoughMoney = FT<{ money: number }, string>('commands/game:notEnoughMoney');
export const C4Description = T<string>('commands/game:c4Description');
export const C4Extended = T<LanguageHelpDisplayOptions>('commands/game:c4Extended');
export const C4Prompt = FT<{ challenger: string; challengee: string }, string>('commands/game:c4Prompt');
export const C4Start = FT<{ player: string }, string>('commands/game:c4Start');
export const C4GameColumnFull = T<string>('commands/game:c4GameColumnFull');
export const C4GameWin = FT<{ user: string }, string>('commands/game:c4GameWin');
export const C4GameWinTurn0 = FT<{ user: string }, string>('commands/game:c4GameWinTurn0');
export const C4GameDraw = T<string>('commands/game:c4GameDraw');
export const C4GameNext = FT<{ user: string }, string>('commands/game:c4GameNext');
export const C4GameNextTurn0 = FT<{ user: string }, string>('commands/game:c4GameNextTurn0');
export const CoinFlipDescription = T<string>('commands/game:coinFlipDescription');
export const CoinFlipExtended = T<LanguageHelpDisplayOptions>('commands/game:coinFlipExtended');
export const CoinFlipInvalidCoinName = FT<{ arg: string }, string>('commands/game:coinFlipInvalidCoinname');
export const CoinFlipCoinNames = T<string[]>('commands/game:coinFlipCoinnames');
export const CoinFlipWinTitle = T<string>('commands/game:coinFlipWinTitle');
export const CoinFlipLoseTitle = T<string>('commands/game:coinFlipLoseTitle');
export const CoinFlipNoGuessTitle = T<string>('commands/game:coinFlipNoguessTitle');
export const CoinFlipWinDescription = FT<{ result: string }, string>('commands/game:coinFlipWinDescription');
export const CoinFlipWinDescriptionWithWager = FT<{ result: string; wager: number }, string>('commands/game:coinFlipWinDescriptionWithWager');
export const CoinFlipLoseDescription = FT<{ result: string }, string>('commands/game:coinFlipLoseDescription');
export const CoinFlipLoseDescriptionWithWager = FT<{ result: string; wager: number }, string>('commands/game:coinFlipLoseDescriptionWithWager');
export const CoinFlipNoGuessDescription = FT<{ result: string }, string>('commands/game:coinFlipNoguessDescription');
export const HigherLowerDescription = T<string>('commands/game:higherLowerDescription');
export const HigherLowerExtended = T<LanguageHelpDisplayOptions>('commands/game:higherLowerExtended');
export const HigherLowerLoading = T<string>('commands/game:higherLowerLoading');
export const HigherLowerNewRound = T<string>('commands/game:higherLowerNewround');
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
>('commands/game:higherLowerEmbed');
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
>('commands/game:higherLowerLose');
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
>('commands/game:higherLowerWin');
export const HigherLowerCancel = FT<
	{
		username: string;
	},
	{
		title: string;
		description: string;
	}
>('commands/game:higherLowerCancel');
export const HigherLowerCashout = FT<{ amount: number }, string>('commands/game:higherLowerCashout');
export const HungerGamesDescription = T<string>('commands/game:hungerGamesDescription');
export const HungerGamesExtended = T<LanguageHelpDisplayOptions>('commands/game:hungerGamesExtended');
export const HungerGamesResultHeaderBloodbath = FT<{ game: HungerGamesGame }, string>('commands/game:hungerGamesResultHeaderBloodbath');
export const HungerGamesResultHeaderSun = FT<{ game: HungerGamesGame }, string>('commands/game:hungerGamesResultHeaderSun');
export const HungerGamesResultHeaderMoon = FT<{ game: HungerGamesGame }, string>('commands/game:hungerGamesResultHeaderMoon');
export const HungerGamesResultDeaths = FT<{ deaths: number }, string>('commands/game:hungerGamesResultDeaths');
export const HungerGamesResultProceed = T<string>('commands/game:hungerGamesResultProceed');
export const HungerGamesStop = T<string>('commands/game:hungerGamesStop');
export const HungerGamesWinner = FT<{ winner: string }, string>('commands/game:hungerGamesWinner');
export const HungerGamesBloodbath = T<readonly string[]>('commands/game:hgBloodbath');
export const HungerGamesDay = T<readonly string[]>('commands/game:hgDay');
export const HungerGamesNight = T<readonly string[]>('commands/game:hgNight');
export const SlotMachineDescription = T<string>('commands/game:slotmachineDescription');
export const SlotMachineExtended = T<LanguageHelpDisplayOptions>('commands/game:slotmachineExtended');
export const SlotMachineWin = FT<{ roll: string; winnings: number }, string>('commands/game:slotmachinesWin');
export const SlotMachineLoss = FT<{ roll: string }, string>('commands/game:slotmachinesLoss');
export const SlotMachineCanvasTextWon = T<string>('commands/game:slotmachineCanvasTextWon');
export const SlotMachineCanvasTextLost = T<string>('commands/game:slotmachineCanvasTextLost');
export const TicTacToeDescription = T<string>('commands/game:ticTacToeDescription');
export const TicTacToeExtended = T<LanguageHelpDisplayOptions>('commands/game:ticTacToeExtended');
export const WheelOfFortuneDescription = T<string>('commands/game:wheelOfFortuneDescription');
export const WheelOfFortuneExtended = T<LanguageHelpDisplayOptions>('commands/game:wheelOfFortuneExtended');
export const WheelOfFortuneCanvasTextWon = T<string>('commands/game:wheelOfFortuneCanvasTextWon');
export const WheelOfFortuneCanvasTextLost = T<string>('commands/game:wheelOfFortuneCanvasTextLost');
export const TicTacToePrompt = FT<{ challenger: string; challengee: string }, string>('commands/game:ticTacToePrompt');
export const TicTacToeTurn = FT<{ icon: string; player: string; board: string }, string>('commands/game:ticTacToeTurn');
export const TicTacToeWinner = FT<{ winner: string; board: string }, string>('commands/game:ticTacToeWinner');
export const TicTacToeDraw = FT<{ board: string }, string>('commands/game:ticTacToeDraw');
export const TriviaDescription = T<string>('commands/game:triviaDescription');
export const TriviaExtended = T<LanguageHelpDisplayOptions>('commands/game:triviaExtended');
export const TriviaInvalidCategory = T<string>('commands/game:triviaInvalidCategory');
export const TriviaActiveGame = T<string>('commands/game:triviaActiveGame');
export const TriviaIncorrect = FT<{ attempt: string }, string>('commands/game:triviaIncorrect');
export const TriviaNoAnswer = FT<{ correctAnswer: string }, string>('commands/game:triviaNoAnswer');
export const TriviaEmbedTitles = T<{
	trivia: string;
	difficulty: string;
}>('commands/game:triviaEmbedTitles');
export const TriviaWinner = FT<{ winner: string; correctAnswer: string }, string>('commands/game:triviaWinner');
