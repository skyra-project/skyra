import { GuildSettings } from '@lib/database';
import { ChannelConfigurationCommand, ChannelConfigurationCommandOptions } from '@lib/structures/ChannelConfigurationCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ChannelConfigurationCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Management.SetImageLogsDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.SetImageLogsExtended),
	responseKey: LanguageKeys.Commands.Management.SetImageLogsSet,
	settingsKey: GuildSettings.Channels.ImageLogs
})
export default class extends ChannelConfigurationCommand {}
