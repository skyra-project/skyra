import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ChannelConfigurationCommand.Options>({
	description: LanguageKeys.Commands.Management.SetModerationLogsDescription,
	detailedDescription: LanguageKeys.Commands.Management.SetModerationLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetModerationLogsSet,
	settingsKey: GuildSettings.Channels.Logs.Moderation
})
export class UserChannelConfigurationCommand extends ChannelConfigurationCommand {}
