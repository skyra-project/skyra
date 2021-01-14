import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand, ChannelConfigurationCommandOptions } from '#lib/structures/commands/ChannelConfigurationCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ChannelConfigurationCommandOptions>({
	description: LanguageKeys.Commands.Management.SetImageLogsDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetImageLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetImageLogsSet,
	settingsKey: GuildSettings.Channels.ImageLogs
})
export default class extends ChannelConfigurationCommand {}
