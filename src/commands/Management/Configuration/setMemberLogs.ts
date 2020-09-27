import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isTextBasedChannel } from '@utils/util';
import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Management.SetMemberLogsDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.SetMemberLogsExtended),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<here|channel:channelname>'
		});
	}

	public async run(message: KlasaMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		else if (!isTextBasedChannel(channel)) throw message.language.get(LanguageKeys.Misc.ConfigurationTextChannelRequired);

		const previous = message.guild!.settings.get(GuildSettings.Channels.MemberLogs);
		if (previous === channel.id) throw message.language.get(LanguageKeys.Misc.ConfigurationEquals);
		await message.guild!.settings.update(GuildSettings.Channels.MemberLogs, channel, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale(LanguageKeys.Commands.Management.SetMemberLogsSet, [{ channel: channel.toString() }]);
	}
}
