import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand, ChannelConfigurationCommandOptions } from '#lib/structures/commands/ChannelConfigurationCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ChannelConfigurationCommandOptions>({
	description: LanguageKeys.Commands.Management.SetModerationLogsDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetModerationLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetModerationLogsSet,
	settingsKey: GuildSettings.Channels.ModerationLogs
})
export default class extends ChannelConfigurationCommand {}
