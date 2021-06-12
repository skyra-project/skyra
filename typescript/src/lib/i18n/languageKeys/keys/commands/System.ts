import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';
import type { StatsGeneral, StatsUptime, StatsUsage } from '#root/commands/System/stats';

export const Disable = FT<{ type: string; name: string }, string>('commands/system:disable');
export const DisableDescription = T<string>('commands/system:disableDescription');
export const DisableExtended = T<LanguageHelpDisplayOptions>('commands/system:disableExtended');
export const DisableWarn = T<string>('commands/system:disableWarn');
export const DmDescription = T<string>('commands/system:dmDescription');
export const DmExtended = T<LanguageHelpDisplayOptions>('commands/system:dmExtended');
export const DmNotSent = T<string>('commands/system:dmNotSent');
export const DmSent = T<string>('commands/system:dmSent');
export const DonateDescription = T<string>('commands/system:donateDescription');
export const DonateExtended = T<LanguageHelpDisplayOptions>('commands/system:donateExtended');
export const EchoDescription = T<string>('commands/system:echoDescription');
export const EchoExtended = T<LanguageHelpDisplayOptions>('commands/system:echoExtended');
export const Enable = FT<{ type: string; name: string }, string>('commands/system:enable');
export const EnableDescription = T<string>('commands/system:enableDescription');
export const EnableExtended = T<LanguageHelpDisplayOptions>('commands/system:enableExtended');
export const EvalDescription = T<string>('commands/system:evalDescription');
export const EvalError = FT<{ time: string; output: string; type: string }, string>('commands/system:evalError');
export const EvalExtended = T<LanguageHelpDisplayOptions>('commands/system:evalExtended');
export const EvalTimeout = FT<{ seconds: number }, string>('commands/system:evalTimeout');
export const ExecDescription = T<string>('commands/system:execDescription');
export const ExecExtended = T<LanguageHelpDisplayOptions>('commands/system:execExtended');
export const Reboot = T<string>('commands/system:reboot');
export const RebootDescription = T<string>('commands/system:rebootDescription');
export const RebootExtended = T<LanguageHelpDisplayOptions>('commands/system:rebootExtended');
export const Reload = FT<{ type: string; name: string; time: string }, string>('commands/system:reload');
export const ReloadAll = FT<{ type: string; time: string }, string>('commands/system:reloadAll');
export const ReloadDescription = T<string>('commands/system:reloadDescription');
export const ReloadExtended = T<LanguageHelpDisplayOptions>('commands/system:reloadExtended');
export const ReloadEverything = FT<{ time: string }, string>('commands/system:reloadEverything');
export const ReloadInvalidEverything = FT<{ parameter: string }, string>('commands/system:reloadInvalidEverything');
export const ReloadLanguage = FT<{ time: string; language: string }, string>('commands/system:reloadLanguage');
export const StatsDescription = T<string>('commands/system:statsDescription');
export const StatsExtended = T<LanguageHelpDisplayOptions>('commands/system:statsExtended');
export const StatsTitles = T<{ stats: string; uptime: string; serverUsage: string }>('commands/system:statsTitles');
export const StatsFields = FT<
	{ stats: StatsGeneral; uptime: StatsUptime; usage: StatsUsage },
	{ stats: string; uptime: string; serverUsage: string }
>('commands/system:statsFields');
export const SupportDescription = T<string>('commands/system:supportDescription');
export const SupportEmbedDescription = T<string>('commands/system:supportEmbedDescription');
export const SupportEmbedTitle = FT<{ username: string }, string>('commands/system:supportEmbedTitle');
export const SupportExtended = T<LanguageHelpDisplayOptions>('commands/system:supportExtended');
