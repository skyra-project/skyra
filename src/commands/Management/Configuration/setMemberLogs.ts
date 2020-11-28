import { GuildSettings } from '#lib/database/index';
import { ChannelConfigurationCommand, ChannelConfigurationCommandOptions } from '#lib/structures/ChannelConfigurationCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ChannelConfigurationCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Management.SetMemberLogsDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.SetMemberLogsExtended),
	responseKey: LanguageKeys.Commands.Management.SetMemberLogsSet,
	settingsKey: GuildSettings.Channels.MemberLogs
})
export default class extends ChannelConfigurationCommand {}
