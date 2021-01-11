import { GuildSettings } from '#lib/database';
import { ChannelConfigurationCommand, ChannelConfigurationCommandOptions } from '#lib/structures/ChannelConfigurationCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ChannelConfigurationCommandOptions>({
	description: LanguageKeys.Commands.Management.SetModerationLogsDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetModerationLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetModerationLogsSet,
	settingsKey: GuildSettings.Channels.ModerationLogs
})
export default class extends ChannelConfigurationCommand {}
