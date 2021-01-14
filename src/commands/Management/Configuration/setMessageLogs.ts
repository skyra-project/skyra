import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand, ChannelConfigurationCommandOptions } from '#lib/structures/commands/ChannelConfigurationCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ChannelConfigurationCommandOptions>({
	description: LanguageKeys.Commands.Management.SetMessageLogsDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetMessageLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetMessageLogsSet,
	settingsKey: GuildSettings.Channels.MessageLogs
})
export default class extends ChannelConfigurationCommand {}
