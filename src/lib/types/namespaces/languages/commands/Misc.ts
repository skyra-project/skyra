import { FT, T } from '#lib/types/index';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const ChaseDescription = T<string>('commandChaseDescription');
export const ChaseExtended = T<LanguageHelpDisplayOptions>('commandChaseExtended');
export const CuddleDescription = T<string>('commandCuddleDescription');
export const CuddleExtended = T<LanguageHelpDisplayOptions>('commandCuddleExtended');
export const DeletthisDescription = T<string>('commandDeletthisDescription');
export const DeletthisExtended = T<LanguageHelpDisplayOptions>('commandDeletthisExtended');
export const FDescription = T<string>('commandFDescription');
export const FExtended = T<LanguageHelpDisplayOptions>('commandFExtended');
export const GoodnightDescription = T<string>('commandGoodnightDescription');
export const GoodnightExtended = T<LanguageHelpDisplayOptions>('commandGoodnightExtended');
export const GoofytimeDescription = T<string>('commandGoofytimeDescription');
export const GoofytimeExtended = T<LanguageHelpDisplayOptions>('commandGoofytimeExtended');
export const HugDescription = T<string>('commandHugDescription');
export const HugExtended = T<LanguageHelpDisplayOptions>('commandHugExtended');
export const IneedhealingDescription = T<string>('commandIneedhealingDescription');
export const IneedhealingExtended = T<LanguageHelpDisplayOptions>('commandIneedhealingExtended');
export const RandRedditDescription = T<string>('commandRandRedditDescription');
export const RandRedditExtended = T<LanguageHelpDisplayOptions>('commandRandRedditExtended');
export const SlapDescription = T<string>('commandSlapDescription');
export const SlapExtended = T<LanguageHelpDisplayOptions>('commandSlapExtended');
export const SnipeDescription = T<string>('commandSnipeDescription');
export const SnipeExtended = T<LanguageHelpDisplayOptions>('commandSnipeExtended');
export const ThesearchDescription = T<string>('commandThesearchDescription');
export const ThesearchExtended = T<LanguageHelpDisplayOptions>('commandThesearchExtended');
export const TriggeredDescription = T<string>('commandTriggeredDescription');
export const TriggeredExtended = T<LanguageHelpDisplayOptions>('commandTriggeredExtended');
export const UpvoteDescription = T<string>('commandUpvoteDescription');
export const UpvoteExtended = T<LanguageHelpDisplayOptions>('commandUpvoteExtended');
export const RandRedditRequiredReddit = T<string>('commandRandRedditRequiredReddit');
export const RandRedditInvalidArgument = T<string>('commandRandRedditInvalidArgument');
export const RandRedditBanned = T<string>('commandRandRedditBanned');
export const RandRedditFail = T<string>('commandRandRedditFail');
export const RandRedditAllNsfw = T<string>('commandRandRedditAllNsfw');
export const RandRedditAllNsfl = T<string>('commandRandRedditAllNsfl');
export const RandRedditMessage = FT<{ title: string; author: string; url: string }, string>('commandRandRedditMessage');
export const RandRedditErrorPrivate = T<string>('commandRandRedditErrorPrivate');
export const RandRedditErrorQuarantined = T<string>('commandRandRedditErrorQuarantined');
export const RandRedditErrorNotFound = T<string>('commandRandRedditErrorNotFound');
export const RandRedditErrorBanned = T<string>('commandRandRedditErrorBanned');
export const RedditUserDescription = T<string>('commandRedditUserDescription');
export const RedditUserExtended = T<LanguageHelpDisplayOptions>('commandRedditUserExtended');
export const RedditUserComplexityLevels = T<string[]>('commandRedditUserComplexityLevels');
export const RedditUserInvalidUser = FT<{ user: string }, string>('commandRedditUserInvalidUser');
export const RedditUserQueryFailed = T<string>('commandRedditUserQueryFailed');
export const RedditUserTitles = T<{
	linkKarma: string;
	commentKarma: string;
	totalComments: string;
	totalSubmissions: string;
	commentControversiality: string;
	textComplexity: string;
	top5Subreddits: string;
	bySubmissions: string;
	byComments: string;
	bestComment: string;
	worstComment: string;
}>('commandRedditUserTitles');
export const RedditUserData = FT<
	{
		user: string;
		timestamp: string;
	},
	{
		overviewFor: string;
		permalink: string;
		dataAvailableFor: string;
		joinedReddit: string;
	}
>('commandRedditUserData');
export const ShipDescription = T<string>('commandShipDescription');
export const ShipExtended = T<LanguageHelpDisplayOptions>('commandShipExtended');
export const ShipData = FT<
	{
		romeoUsername: string;
		julietUsername: string;
		shipName: string;
	},
	{
		title: string;
		description: string;
	}
>('commandShipData');
export const SnipeEmpty = T<string>('commandSnipeEmpty');
export const SnipeTitle = T<string>('commandSnipeTitle');
export const UpvoteMessage = T<string>('commandUpvoteMessage');
export const VaporwaveDescription = T<string>('commandVaporwaveDescription');
export const VaporwaveExtended = T<LanguageHelpDisplayOptions>('commandVaporwaveExtended');
export const VaporwaveOutput = FT<{ str: string }, string>('commandVaporwaveOutput');
