import { FT, T } from '#lib/types';
import { StatsGeneral, StatsUptime, StatsUsage } from '#root/commands/System/stats';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const Disable = FT<{ type: string; name: string }, string>('commandDisable');
export const DisableDescription = T<string>('commandDisableDescription');
export const DisableWarn = T<string>('commandDisableWarn');
export const DmDescription = T<string>('commandDmDescription');
export const DmExtended = T<LanguageHelpDisplayOptions>('commandDmExtended');
export const DmNotSent = T<string>('commandDmNotSent');
export const DmSent = T<string>('commandDmSent');
export const DonateDescription = T<string>('commandDonateDescription');
export const DonateExtended = T<LanguageHelpDisplayOptions>('commandDonateExtended');
export const EchoDescription = T<string>('commandEchoDescription');
export const EchoExtended = T<LanguageHelpDisplayOptions>('commandEchoExtended');
export const Enable = FT<{ type: string; name: string }, string>('commandEnable');
export const EnableDescription = T<string>('commandEnableDescription');
export const EvalDescription = T<string>('commandEvalDescription');
export const EvalError = FT<{ time: string; output: string; type: string }, string>('commandEvalError');
export const EvalExtended = T<LanguageHelpDisplayOptions>('commandEvalExtended');
export const EvalTimeout = FT<{ seconds: number }, string>('commandEvalTimeout');
export const ExecDescription = T<string>('commandExecDescription');
export const ExecExtended = T<LanguageHelpDisplayOptions>('commandExecExtended');
export const FeedbackDescription = T<string>('commandFeedbackDescription');
export const FeedbackExtended = T<LanguageHelpDisplayOptions>('commandFeedbackExtended');
export const Load = FT<{ time: string; type: string; name: string }, string>('commandLoad');
export const LoadDescription = T<string>('commandLoadDescription');
export const LoadError = FT<{ type: string; name: string; error: string }, string>('commandLoadError');
export const LoadFail = T<string>('commandLoadFail');
export const Reboot = T<string>('commandReboot');
export const RebootDescription = T<string>('commandRebootDescription');
export const Reload = FT<{ type: string; name: string; time: string }, string>('commandReload');
export const ReloadAll = FT<{ type: string; time: string }, string>('commandReloadAll');
export const ReloadDescription = T<string>('commandReloadDescription');
export const ReloadEverything = FT<{ time: string }, string>('commandReloadEverything');
export const ReloadFailed = FT<{ type: string; name: string }, string>('commandReloadFailed');
export const SetAvatarDescription = T<string>('commandSetAvatarDescription');
export const SetAvatarExtended = T<LanguageHelpDisplayOptions>('commandSetAvatarExtended');
export const StatsDescription = T<string>('commandStatsDescription');
export const StatsExtended = T<LanguageHelpDisplayOptions>('commandStatsExtended');
export const StatsTitles = T<{
	stats: string;
	uptime: string;
	serverUsage: string;
}>('commandStatsTitles');
export const StatsFields = FT<
	{
		stats: StatsGeneral;
		uptime: StatsUptime;
		usage: StatsUsage;
	},
	{
		stats: string[];
		uptime: string[];
		serverUsage: string[];
	}
>('commandStatsFields');
export const SupportDescription = T<string>('commandSupportDescription');
export const SupportEmbedDescription = T<string>('commandSupportEmbedDescription');
export const SupportEmbedTitle = FT<{ username: string }, string>('commandSupportEmbedTitle');
export const SupportExtended = T<LanguageHelpDisplayOptions>('commandSupportExtended');
export const TransferDescription = T<string>('commandTransferDescription');
export const TransferError = T<string>('commandTransferError');
export const TransferFailed = FT<{ type: string; name: string }, string>('commandTransferFailed');
export const TransferSuccess = FT<{ type: string; name: string }, string>('commandTransferSuccess');
export const Unload = FT<{ type: string; name: string }, string>('commandUnload');
export const UnloadDescription = T<string>('commandUnloadDescription');
