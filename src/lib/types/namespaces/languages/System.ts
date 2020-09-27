import { FT, T } from '@lib/types/Shared';

export const PoweredByWeebsh = T<string>('systemPoweredByWeebsh');
export const ParseError = T<string>('systemParseError');
export const HighestRole = T<string>('systemHighestRole');
export const ChannelNotPostable = T<string>('systemChannelNotPostable');
export const FetchbansFail = T<string>('systemFetchbansFail');
export const Loading = T<readonly string[]>('systemLoading');
export const Error = T<string>('systemError');
export const DatabaseError = T<string>('systemDatabaseError');
export const DiscordAborterror = T<string>('systemDiscordAborterror');
export const QueryFail = T<string>('systemQueryFail');
export const NoResults = T<string>('systemNoResults');
export const MessageNotFound = T<string>('systemMessageNotFound');
export const NotenoughParameters = T<string>('systemNotenoughParameters');
export const CannotAccessChannel = T<string>('systemCannotAccessChannel');
export const ExceededLengthOutput = FT<{ output: string; time?: string; type?: string }, string>('systemExceededLengthOutput');
export const ExceededLengthOutputWithTypeAndTime = FT<{ output: string; time?: string; type?: string }, string>(
	'systemExceededLengthOutputWithTypeAndTime'
);
export const ExceededLengthOutputConsole = FT<{ time?: string; type?: string }, string>('systemExceededLengthOutputConsole');
export const ExceededLengthOutputConsoleWithTypeAndTime = FT<{ time?: string; type?: string }, string>(
	'systemExceededLengthOutputConsoleWithTypeAndTime'
);
export const ExceededLengthOutputFile = FT<{ time?: string; type?: string }, string>('systemExceededLengthOutputFile');
export const ExceededLengthOutputFileWithTypeAndTime = FT<{ time?: string; type?: string }, string>('systemExceededLengthOutputFileWithTypeAndTime');
export const ExceededLengthOutputHastebin = FT<{ url: string; time?: string; type?: string }, string>('systemExceededLengthOutputHastebin');
export const ExceededLengthOutputHastebinWithTypeAndTime = FT<{ url: string; time?: string; type?: string }, string>(
	'systemExceededLengthOutputHastebinWithTypeAndTime'
);
export const ExceededLengthChooseOutput = FT<{ output: string[] }, string>('systemExceededLengthChooseOutput');
export const ExternalServerError = T<string>('systemExternalServerError');
export const PokedexExternalResource = T<string>('systemPokedexExternalResource');
export const HelpTitles = T<{
	explainedUsage: string;
	possibleFormats: string;
	examples: string;
	reminders: string;
}>('systemHelpTitles');
