import { T } from '@lib/types/Shared';
import { LanguageHelpDisplayOptions } from '@utils/LanguageHelp';

export const SuggestDescription = T<string>('commandSuggestDescription');
export const SuggestExtended = T<LanguageHelpDisplayOptions>('commandSuggestExtended');
export const ResolveSuggestionDescription = T<string>('commandResolveSuggestionDescription');
export const ResolveSuggestionExtended = T<LanguageHelpDisplayOptions>('commandResolveSuggestionExtended');
export const SuggestNoSetup = T<(params: { username: string }) => string>('commandSuggestNoSetup');
export const SuggestNoSetupAsk = T<(params: { username: string }) => string>('commandSuggestNoSetupAsk');
export const SuggestNoSetupAbort = T<string>('commandSuggestNoSetupAbort');
export const SuggestNopermissions = T<(params: { username: string; channel: string }) => string>('commandSuggestNopermissions');
export const SuggestChannelPrompt = T<string>('commandSuggestChannelPrompt');
export const SuggestTitle = T<(params: { id: number }) => string>('commandSuggestTitle');
export const SuggestSuccess = T<(params: { channel: string }) => string>('commandSuggestSuccess');
export const ResolveSuggestionInvalidId = T<string>('commandResolveSuggestionInvalidId');
export const ResolveSuggestionMessageNotFound = T<string>('commandResolveSuggestionMessageNotFound');
export const ResolveSuggestionIdNotFound = T<string>('commandResolveSuggestionIdNotFound');
export const ResolveSuggestionDefaultComment = T<string>('commandResolveSuggestionDefaultComment');
export const ResolveSuggestionAuthorAdmin = T<string>('commandResolveSuggestionAuthorAdmin');
export const ResolveSuggestionAuthorModerator = T<string>('commandResolveSuggestionAuthorModerator');
export const ResolveSuggestionActions = T<
	(params: {
		author: string;
	}) => {
		accept: string;
		consider: string;
		deny: string;
	}
>('commandResolveSuggestionActions');
export const ResolveSuggestionActionsDms = T<
	(params: {
		author: string;
		guild: string;
	}) => {
		accept: string;
		consider: string;
		deny: string;
	}
>('commandResolveSuggestionActionsDms');
export const ResolveSuggestionDmFail = T<string>('commandResolveSuggestionDmFail');
export const ResolveSuggestionSuccess = T<(params: { id: number; actionText: string }) => string>('commandResolveSuggestionSuccess');
export const ResolveSuggestionSuccessAcceptedText = T<string>('commandResolveSuggestionSuccessAcceptedText');
export const ResolveSuggestionSuccessDeniedText = T<string>('commandResolveSuggestionSuccessDeniedText');
export const ResolveSuggestionSuccessConsideredText = T<string>('commandResolveSuggestionSuccessConsideredText');
