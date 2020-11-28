import { GuildSettings } from '#lib/database/index';
import { ChannelConfigurationCommand, ChannelConfigurationCommandOptions } from '#lib/structures/ChannelConfigurationCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ChannelConfigurationCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Management.SetMessageLogsDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.SetMessageLogsExtended),
	responseKey: LanguageKeys.Commands.Management.SetMessageLogsSet,
	settingsKey: GuildSettings.Channels.MessageLogs
})
export default class extends ChannelConfigurationCommand {}
