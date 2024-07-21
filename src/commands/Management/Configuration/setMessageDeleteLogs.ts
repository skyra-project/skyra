import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ChannelConfigurationCommand.Options>({
	description: LanguageKeys.Commands.Management.SetMessageDeleteLogsDescription,
	detailedDescription: LanguageKeys.Commands.Management.SetMessageDeleteLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetMessageDeleteLogsSet,
	settingsKey: 'channelsLogsMessageDelete'
})
export class UserChannelConfigurationCommand extends ChannelConfigurationCommand {}
