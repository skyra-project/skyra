import { FT, T } from '#lib/types';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const ResolveSuggestionActions = FT<
	{
		author: string;
	},
	{
		accept: string;
		consider: string;
		deny: string;
	}
>('commands/suggestion:resolveSuggestionActions');
export const ResolveSuggestionActionsDms = FT<
	{
		author: string;
		guild: string;
	},
	{
		accept: string;
		consider: string;
		deny: string;
	}
>('commands/suggestion:resolveSuggestionActionsDms');
export const ResolveSuggestionAuthorAdmin = T<string>('commands/suggestion:resolveSuggestionAuthorAdmin');
export const ResolveSuggestionAuthorModerator = T<string>('commands/suggestion:resolveSuggestionAuthorModerator');
export const ResolveSuggestionDefaultComment = T<string>('commands/suggestion:resolveSuggestionDefaultComment');
export const ResolveSuggestionDescription = T<string>('commands/suggestion:resolveSuggestionDescription');
export const ResolveSuggestionDmFail = T<string>('commands/suggestion:resolveSuggestionDmFail');
export const ResolveSuggestionExtended = T<LanguageHelpDisplayOptions>('commands/suggestion:resolveSuggestionExtended');
export const ResolveSuggestionIdNotFound = T<string>('commands/suggestion:resolveSuggestionIdNotFound');
export const ResolveSuggestionInvalidId = T<string>('commands/suggestion:resolveSuggestionInvalidId');
export const ResolveSuggestionMessageNotFound = T<string>('commands/suggestion:resolveSuggestionMessageNotFound');
export const ResolveSuggestionSuccess = FT<{ id: number; actionText: string }, string>('commands/suggestion:resolveSuggestionSuccess');
export const ResolveSuggestionSuccessAcceptedText = T<string>('commands/suggestion:resolveSuggestionSuccessAcceptedText');
export const ResolveSuggestionSuccessConsideredText = T<string>('commands/suggestion:resolveSuggestionSuccessConsideredText');
export const ResolveSuggestionSuccessDeniedText = T<string>('commands/suggestion:resolveSuggestionSuccessDeniedText');
export const SuggestChannelPrompt = T<string>('commands/suggestion:suggestChannelPrompt');
export const SuggestDescription = T<string>('commands/suggestion:suggestDescription');
export const SuggestExtended = T<LanguageHelpDisplayOptions>('commands/suggestion:suggestExtended');
export const SuggestNopermissions = FT<{ username: string; channel: string }, string>('commands/suggestion:suggestNopermissions');
export const SuggestNoSetup = FT<{ username: string }, string>('commands/suggestion:suggestNoSetup');
export const SuggestNoSetupAbort = T<string>('commands/suggestion:suggestNoSetupAbort');
export const SuggestNoSetupAsk = FT<{ username: string }, string>('commands/suggestion:suggestNoSetupAsk');
export const SuggestSuccess = FT<{ channel: string }, string>('commands/suggestion:suggestSuccess');
export const SuggestTitle = FT<{ id: number }, string>('commands/suggestion:suggestTitle');
