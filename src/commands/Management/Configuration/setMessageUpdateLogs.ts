import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ChannelConfigurationCommand.Options>({
	description: LanguageKeys.Commands.Management.SetMessageUpdateLogsDescription,
	detailedDescription: LanguageKeys.Commands.Management.SetMessageUpdateLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetMessageUpdateLogsSet,
	settingsKey: 'channelsLogsMessageUpdate'
})
export class UserChannelConfigurationCommand extends ChannelConfigurationCommand {}
