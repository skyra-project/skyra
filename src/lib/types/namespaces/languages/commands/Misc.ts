import { FT, T } from '#lib/types';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const ChaseDescription = T<string>('commands/misc:chaseDescription');
export const ChaseExtended = T<LanguageHelpDisplayOptions>('commands/misc:chaseExtended');
export const CuddleDescription = T<string>('commands/misc:cuddleDescription');
export const CuddleExtended = T<LanguageHelpDisplayOptions>('commands/misc:cuddleExtended');
export const DeletthisDescription = T<string>('commands/misc:deletthisDescription');
export const DeletthisExtended = T<LanguageHelpDisplayOptions>('commands/misc:deletthisExtended');
export const FDescription = T<string>('commands/misc:fDescription');
export const FExtended = T<LanguageHelpDisplayOptions>('commands/misc:fExtended');
export const GoodnightDescription = T<string>('commands/misc:goodnightDescription');
export const GoodnightExtended = T<LanguageHelpDisplayOptions>('commands/misc:goodnightExtended');
export const GoofytimeDescription = T<string>('commands/misc:goofytimeDescription');
export const GoofytimeExtended = T<LanguageHelpDisplayOptions>('commands/misc:goofytimeExtended');
export const HugDescription = T<string>('commands/misc:hugDescription');
export const HugExtended = T<LanguageHelpDisplayOptions>('commands/misc:hugExtended');
export const IneedhealingDescription = T<string>('commands/misc:ineedhealingDescription');
export const IneedhealingExtended = T<LanguageHelpDisplayOptions>('commands/misc:ineedhealingExtended');
export const RandRedditAllNsfl = T<string>('commands/misc:randRedditAllNsfl');
export const RandRedditAllNsfw = T<string>('commands/misc:randRedditAllNsfw');
export const RandRedditBanned = T<string>('commands/misc:randRedditBanned');
export const RandRedditDescription = T<string>('commands/misc:randRedditDescription');
export const RandRedditErrorBanned = T<string>('commands/misc:randRedditErrorBanned');
export const RandRedditErrorNotFound = T<string>('commands/misc:randRedditErrorNotFound');
export const RandRedditErrorPrivate = T<string>('commands/misc:randRedditErrorPrivate');
export const RandRedditErrorQuarantined = T<string>('commands/misc:randRedditErrorQuarantined');
export const RandRedditExtended = T<LanguageHelpDisplayOptions>('commands/misc:randRedditExtended');
export const RandRedditFail = T<string>('commands/misc:randRedditFail');
export const RandRedditInvalidArgument = T<string>('commands/misc:randRedditInvalidArgument');
export const RandRedditMessage = FT<{ title: string; author: string; url: string }, string>('commands/misc:randRedditMessage');
export const RandRedditRequiredReddit = T<string>('commands/misc:randRedditRequiredReddit');
export const RedditUserComplexityLevels = T<string[]>('commands/misc:redditUserComplexityLevels');
export const RedditUserData = FT<
	{ user: string; timestamp: number },
	{ overviewFor: string; permalink: string; dataAvailableFor: string; joinedReddit: string }
>('commands/misc:redditUserData');
export const RedditUserDescription = T<string>('commands/misc:redditUserDescription');
export const RedditUserExtended = T<LanguageHelpDisplayOptions>('commands/misc:redditUserExtended');
export const RedditUserInvalidUser = FT<{ user: string }, string>('commands/misc:redditUserInvalidUser');
export const RedditUserQueryFailed = T<string>('commands/misc:redditUserQueryFailed');
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
}>('commands/misc:redditUserTitles');
export const ShipData = FT<{ romeoUsername: string; julietUsername: string; shipName: string }, { title: string; description: string }>(
	'commands/misc:shipData'
);
export const ShipDescription = T<string>('commands/misc:shipDescription');
export const ShipExtended = T<LanguageHelpDisplayOptions>('commands/misc:shipExtended');
export const SlapDescription = T<string>('commands/misc:slapDescription');
export const SlapExtended = T<LanguageHelpDisplayOptions>('commands/misc:slapExtended');
export const SnipeDescription = T<string>('commands/misc:snipeDescription');
export const SnipeEmpty = T<string>('commands/misc:snipeEmpty');
export const SnipeExtended = T<LanguageHelpDisplayOptions>('commands/misc:snipeExtended');
export const SnipeTitle = T<string>('commands/misc:snipeTitle');
export const ThesearchDescription = T<string>('commands/misc:thesearchDescription');
export const ThesearchExtended = T<LanguageHelpDisplayOptions>('commands/misc:thesearchExtended');
export const TriggeredDescription = T<string>('commands/misc:triggeredDescription');
export const TriggeredExtended = T<LanguageHelpDisplayOptions>('commands/misc:triggeredExtended');
export const UpvoteDescription = T<string>('commands/misc:upvoteDescription');
export const UpvoteExtended = T<LanguageHelpDisplayOptions>('commands/misc:upvoteExtended');
export const UpvoteMessage = T<string>('commands/misc:upvoteMessage');
export const VaporwaveDescription = T<string>('commands/misc:vaporwaveDescription');
export const VaporwaveExtended = T<LanguageHelpDisplayOptions>('commands/misc:vaporwaveExtended');
export const VaporwaveOutput = FT<{ str: string }, string>('commands/misc:vaporwaveOutput');
