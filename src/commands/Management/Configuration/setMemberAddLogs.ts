import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ChannelConfigurationCommand.Options>({
	description: LanguageKeys.Commands.Management.SetMemberAddLogsDescription,
	detailedDescription: LanguageKeys.Commands.Management.SetMemberAddLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetMemberAddLogsSet,
	settingsKey: 'channelsLogsMemberAdd'
})
export class UserChannelConfigurationCommand extends ChannelConfigurationCommand {}
