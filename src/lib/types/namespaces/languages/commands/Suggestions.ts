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
>('commands/suggesstion:resolveSuggestionActions');
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
>('commands/suggesstion:resolveSuggestionActionsDms');
export const ResolveSuggestionAuthorAdmin = T<string>('commands/suggesstion:resolveSuggestionAuthorAdmin');
export const ResolveSuggestionAuthorModerator = T<string>('commands/suggesstion:resolveSuggestionAuthorModerator');
export const ResolveSuggestionDefaultComment = T<string>('commands/suggesstion:resolveSuggestionDefaultComment');
export const ResolveSuggestionDescription = T<string>('commands/suggesstion:resolveSuggestionDescription');
export const ResolveSuggestionDmFail = T<string>('commands/suggesstion:resolveSuggestionDmFail');
export const ResolveSuggestionExtended = T<LanguageHelpDisplayOptions>('commands/suggesstion:resolveSuggestionExtended');
export const ResolveSuggestionIdNotFound = T<string>('commands/suggesstion:resolveSuggestionIdNotFound');
export const ResolveSuggestionInvalidId = T<string>('commands/suggesstion:resolveSuggestionInvalidId');
export const ResolveSuggestionMessageNotFound = T<string>('commands/suggesstion:resolveSuggestionMessageNotFound');
export const ResolveSuggestionSuccess = FT<{ id: number; actionText: string }, string>('commands/suggesstion:resolveSuggestionSuccess');
export const ResolveSuggestionSuccessAcceptedText = T<string>('commands/suggesstion:resolveSuggestionSuccessAcceptedText');
export const ResolveSuggestionSuccessConsideredText = T<string>('commands/suggesstion:resolveSuggestionSuccessConsideredText');
export const ResolveSuggestionSuccessDeniedText = T<string>('commands/suggesstion:resolveSuggestionSuccessDeniedText');
export const SuggestChannelPrompt = T<string>('commands/suggesstion:suggestChannelPrompt');
export const SuggestDescription = T<string>('commands/suggesstion:suggestDescription');
export const SuggestExtended = T<LanguageHelpDisplayOptions>('commands/suggesstion:suggestExtended');
export const SuggestNopermissions = FT<{ username: string; channel: string }, string>('commands/suggesstion:suggestNopermissions');
export const SuggestNoSetup = FT<{ username: string }, string>('commands/suggesstion:suggestNoSetup');
export const SuggestNoSetupAbort = T<string>('commands/suggesstion:suggestNoSetupAbort');
export const SuggestNoSetupAsk = FT<{ username: string }, string>('commands/suggesstion:suggestNoSetupAsk');
export const SuggestSuccess = FT<{ channel: string }, string>('commands/suggesstion:suggestSuccess');
export const SuggestTitle = FT<{ id: number }, string>('commands/suggesstion:suggestTitle');
