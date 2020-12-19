import { FT, T } from '#lib/types';

export const PoweredByWeebSh = T<string>('system:poweredByWeebSh');
export const ParseError = T<string>('system:parseError');
export const HighestRole = T<string>('system:highestRole');
export const ChannelNotPostable = T<string>('system:channelNotPostable');
export const FetchBansFail = T<string>('system:fetchBansFail');
export const Loading = T<readonly string[]>('system:loading');
export const Error = T<string>('system:error');
export const DatabaseError = T<string>('system:databaseError');
export const DiscordAbortError = T<string>('system:discordAbortError');
export const QueryFail = T<string>('system:queryFail');
export const NoResults = T<string>('system:noResults');
export const MessageNotFound = T<string>('system:messageNotFound');
export const NotEnoughParameters = T<string>('system:notEnoughParameters');
export const CannotAccessChannel = T<string>('system:cannotAccessChannel');
export const ExceededLengthOutput = FT<{ output: string; time?: string; type?: string }, string>('system:exceededLengthOutput');
export const ExceededLengthOutputWithTypeAndTime = FT<{ output: string; time?: string; type?: string }, string>(
	'system:exceededLengthOutputWithTypeAndTime'
);
export const ExceededLengthOutputConsole = FT<{ time?: string; type?: string }, string>('system:exceededLengthOutputConsole');
export const ExceededLengthOutputConsoleWithTypeAndTime = FT<{ time?: string; type?: string }, string>(
	'system:exceededLengthOutputConsoleWithTypeAndTime'
);
export const ExceededLengthOutputFile = FT<{ time?: string; type?: string }, string>('system:exceededLengthOutputFile');
export const ExceededLengthOutputFileWithTypeAndTime = FT<{ time?: string; type?: string }, string>('system:exceededLengthOutputFileWithTypeAndTime');
export const ExceededLengthOutputHastebin = FT<{ url: string; time?: string; type?: string }, string>('system:exceededLengthOutputHastebin');
export const ExceededLengthOutputHastebinWithTypeAndTime = FT<{ url: string; time?: string; type?: string }, string>(
	'system:exceededLengthOutputHastebinWithTypeAndTime'
);
export const ExceededLengthChooseOutput = FT<{ output: string[] }, string>('system:exceededLengthChooseOutput');
export const ExternalServerError = T<string>('system:externalServerError');
export const PokedexExternalResource = T<string>('system:pokedexExternalResource');
export const HelpTitles = T<{
	explainedUsage: string;
	possibleFormats: string;
	examples: string;
	reminders: string;
}>('system:helpTitles');
