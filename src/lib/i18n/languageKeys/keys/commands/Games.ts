import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';
import type { HungerGamesGame } from '#root/commands/Games/hungergames';

export const GamesBot = T<string>('commands/game:gamesBot');
export const GamesSelf = T<string>('commands/game:gamesSelf');
export const GamesProgress = T<string>('commands/game:gamesProgress');
export const GamesNoPlayers = FT<{ prefix: string }, string>('commands/game:gamesNoPlayers');
export const GamesTooManyOrFew = FT<{ min: number; max: number }, string>('commands/game:gamesTooManyOrFew');
export const GamesRepeat = T<string>('commands/game:gamesRepeat');
export const GamesPromptDeny = T<string>('commands/game:gamesPromptDeny');
export const C4Description = T<string>('commands/game:c4Description');
export const C4Extended = T<LanguageHelpDisplayOptions>('commands/game:c4Extended');
export const C4Prompt = FT<{ challenger: string; challengee: string }, string>('commands/game:c4Prompt');
export const HungerGamesDescription = T<string>('commands/game:hungerGamesDescription');
export const HungerGamesExtended = T<LanguageHelpDisplayOptions>('commands/game:hungerGamesExtended');
export const HungerGamesResultHeaderBloodbath = FT<{ game: HungerGamesGame }, string>('commands/game:hungerGamesResultHeaderBloodbath');
export const HungerGamesResultHeaderSun = FT<{ game: HungerGamesGame }, string>('commands/game:hungerGamesResultHeaderSun');
export const HungerGamesResultHeaderMoon = FT<{ game: HungerGamesGame }, string>('commands/game:hungerGamesResultHeaderMoon');
export const HungerGamesResultDeaths = FT<{ count: number }, string>('commands/game:hungerGamesResultDeaths');
export const HungerGamesResultProceed = T<string>('commands/game:hungerGamesResultProceed');
export const HungerGamesStop = T<string>('commands/game:hungerGamesStop');
export const HungerGamesWinner = FT<{ winner: string }, string>('commands/game:hungerGamesWinner');
export const HungerGamesBloodbath = T<readonly string[]>('commands/game:hgBloodbath');
export const HungerGamesDay = T<readonly string[]>('commands/game:hgDay');
export const HungerGamesNight = T<readonly string[]>('commands/game:hgNight');
export const TicTacToeDescription = T<string>('commands/game:ticTacToeDescription');
export const TicTacToeExtended = T<LanguageHelpDisplayOptions>('commands/game:ticTacToeExtended');
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
export const TriviaEmbedTitles = T<{ trivia: string; difficulty: string }>('commands/game:triviaEmbedTitles');
export const TriviaWinner = FT<{ winner: string; correctAnswer: string }, string>('commands/game:triviaWinner');
