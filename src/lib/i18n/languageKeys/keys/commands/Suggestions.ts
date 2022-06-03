import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const ResolveSuggestionActions = FT<{ author: string }, { accept: string; consider: string; deny: string }>(
	'commands/suggestion:resolveSuggestionActions'
);
export const ResolveSuggestionActionsDms = FT<{ author: string; guild: string }, { accept: string; consider: string; deny: string }>(
	'commands/suggestion:resolveSuggestionActionsDms'
);
export const ResolveSuggestionTooManyFields = T('commands/suggestion:resolveSuggestionTooManyFields');
export const ResolveSuggestionTooManyCharacters = FT<{ maximum: number; amount: number }>('commands/suggestion:resolveSuggestionTooManyCharacters');
export const ResolveSuggestionAuthorAdmin = T('commands/suggestion:resolveSuggestionAuthorAdmin');
export const ResolveSuggestionAuthorModerator = T('commands/suggestion:resolveSuggestionAuthorModerator');
export const ResolveSuggestionDefaultComment = T('commands/suggestion:resolveSuggestionDefaultComment');
export const ResolveSuggestionDescription = T('commands/suggestion:resolveSuggestionDescription');
export const ResolveSuggestionDmFail = T('commands/suggestion:resolveSuggestionDmFail');
export const ResolveSuggestionExtended = T<LanguageHelpDisplayOptions>('commands/suggestion:resolveSuggestionExtended');
export const ResolveSuggestionIdNotFound = T('commands/suggestion:resolveSuggestionIdNotFound');
export const ResolveSuggestionInvalidId = T('commands/suggestion:resolveSuggestionInvalidId');
export const ResolveSuggestionInvalidAction = FT<{ parameter: string; possibles: readonly string[] }, string>(
	'commands/suggestion:resolveSuggestionInvalidAction'
);
export const ResolveSuggestionMessageNotFound = T('commands/suggestion:resolveSuggestionMessageNotFound');
export const ResolveSuggestionSuccess = FT<{ id: number; actionText: string }, string>('commands/suggestion:resolveSuggestionSuccess');
export const ResolveSuggestionSuccessAcceptedText = T('commands/suggestion:resolveSuggestionSuccessAcceptedText');
export const ResolveSuggestionSuccessConsideredText = T('commands/suggestion:resolveSuggestionSuccessConsideredText');
export const ResolveSuggestionSuccessDeniedText = T('commands/suggestion:resolveSuggestionSuccessDeniedText');
export const SuggestNoSetup = FT<{ username: string }, string>('commands/suggestion:suggestNoSetup');
