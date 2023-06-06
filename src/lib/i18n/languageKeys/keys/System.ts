import { FT, T } from '#lib/types';

export const FetchBansFail = T('system:fetchBansFail');
export const Loading = T<readonly string[]>('system:loading');
export const DiscordAbortError = T('system:discordAbortError');
export const ExceededLengthOutput = FT<{ output: string }>('system:exceededLengthOutput');
export const ExceededLengthOutputConsole = T('system:exceededLengthOutputConsole');
export const ExceededLengthOutputFile = T('system:exceededLengthOutputFile');
export const ExceededLengthOutputHastebin = FT<{ url: string }>('system:exceededLengthOutputHastebin');
export const ExceededLengthChooseOutput = FT<{ output: string[] }>('system:exceededLengthChooseOutput');
export const ExceededLengthOutputType = FT<{ type: string }>('system:exceededLengthOutputType');
export const ExceededLengthOutputTime = FT<{ time: string }>('system:exceededLengthOutputTime');
export const HelpTitles = T<{
	aliases: string;
	usages: string;
	extendedHelp: string;
	explainedUsage: string;
	possibleFormats: string;
	examples: string;
	reminders: string;
}>('system:helpTitles');
export const ReminderHeader = FT<{ timestamp: string }>('system:reminderHeader');
