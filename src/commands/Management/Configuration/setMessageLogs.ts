import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ChannelConfigurationCommand.Options>({
	description: LanguageKeys.Commands.Management.SetMessageLogsDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetMessageLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetMessageLogsSet,
	settingsKey: GuildSettings.Channels.MessageLogs
})
export class UserChannelConfigurationCommand extends ChannelConfigurationCommand {}
