import { FT, T } from '#lib/types';

export const PoweredByWeebSh = T('system:poweredByWeebSh');
export const ParseError = T('system:parseError');
export const HighestRole = T('system:highestRole');
export const ChannelNotPostable = T('system:channelNotPostable');
export const FetchBansFail = T('system:fetchBansFail');
export const Loading = T<readonly string[]>('system:loading');
export const DiscordAbortError = T('system:discordAbortError');
export const QueryFail = T('system:queryFail');
export const NoResults = T('system:noResults');
export const ExceededLengthOutput = FT<{ output: string }>('system:exceededLengthOutput');
export const ExceededLengthOutputConsole = T('system:exceededLengthOutputConsole');
export const ExceededLengthOutputFile = T('system:exceededLengthOutputFile');
export const ExceededLengthOutputHastebin = FT<{ url: string }>('system:exceededLengthOutputHastebin');
export const ExceededLengthChooseOutput = FT<{ output: string[] }>('system:exceededLengthChooseOutput');
export const ExceededLengthOutputType = FT<{ type: string }>('system:exceededLengthOutputType');
export const ExceededLengthOutputTime = FT<{ time: string }>('system:exceededLengthOutputTime');
export const ExternalServerError = T('system:externalServerError');
export const PokedexExternalResource = T('system:pokedexExternalResource');
export const HelpTitles = T<{
	aliases: string;
	usages: string;
	extendedHelp: string;
	explainedUsage: string;
	possibleFormats: string;
	examples: string;
	reminders: string;
}>('system:helpTitles');
