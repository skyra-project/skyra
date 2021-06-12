import { FT, T } from '#lib/types';

export const PoweredByWeebSh = T<string>('system:poweredByWeebSh');
export const ParseError = T<string>('system:parseError');
export const HighestRole = T<string>('system:highestRole');
export const ChannelNotPostable = T<string>('system:channelNotPostable');
export const FetchBansFail = T<string>('system:fetchBansFail');
export const Loading = T<readonly string[]>('system:loading');
export const DiscordAbortError = T<string>('system:discordAbortError');
export const QueryFail = T<string>('system:queryFail');
export const NoResults = T<string>('system:noResults');
export const ExceededLengthOutput = FT<{ output: string }, string>('system:exceededLengthOutput');
export const ExceededLengthOutputConsole = T<string>('system:exceededLengthOutputConsole');
export const ExceededLengthOutputFile = T<string>('system:exceededLengthOutputFile');
export const ExceededLengthOutputHastebin = FT<{ url: string }, string>('system:exceededLengthOutputHastebin');
export const ExceededLengthChooseOutput = FT<{ output: string[] }, string>('system:exceededLengthChooseOutput');
export const ExceededLengthOutputType = FT<{ type: string }, string>('system:exceededLengthOutputType');
export const ExceededLengthOutputTime = FT<{ time: string }, string>('system:exceededLengthOutputTime');
export const ExternalServerError = T<string>('system:externalServerError');
export const PokedexExternalResource = T<string>('system:pokedexExternalResource');
export const HelpTitles = T<{
	aliases: string;
	usages: string;
	extendedHelp: string;
	explainedUsage: string;
	possibleFormats: string;
	examples: string;
	reminders: string;
}>('system:helpTitles');
