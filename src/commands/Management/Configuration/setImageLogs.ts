import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ChannelConfigurationCommand.Options>({
	description: LanguageKeys.Commands.Management.SetImageLogsDescription,
	detailedDescription: LanguageKeys.Commands.Management.SetImageLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetImageLogsSet,
	settingsKey: GuildSettings.Channels.Logs.Image
})
export class UserChannelConfigurationCommand extends ChannelConfigurationCommand {}
