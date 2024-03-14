import { T } from '#lib/types';

export const FetchBansFail = T('system:fetchBansFail');
export const Loading = T<readonly string[]>('system:loading');
export const DiscordAbortError = T('system:discordAbortError');
export const HelpTitles = T<{
	aliases: string;
	usages: string;
	extendedHelp: string;
	explainedUsage: string;
	possibleFormats: string;
	examples: string;
	reminders: string;
}>('system:helpTitles');
