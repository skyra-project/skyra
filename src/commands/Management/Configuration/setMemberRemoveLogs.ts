import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ChannelConfigurationCommand.Options>({
	description: LanguageKeys.Commands.Management.SetMemberRemoveLogsDescription,
	detailedDescription: LanguageKeys.Commands.Management.SetMemberRemoveLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetMemberRemoveLogsSet,
	settingsKey: 'channelsLogsMemberRemove'
})
export class UserChannelConfigurationCommand extends ChannelConfigurationCommand {}
