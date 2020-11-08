import { GuildSettings } from '@lib/database';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isTextBasedChannel } from '@utils/util';
import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Management.SetIgnoreChannelsDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.SetIgnoreChannelsExtended),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<here|channel:channelname>'
		});
	}

	public async run(message: KlasaMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		else if (!isTextBasedChannel(channel)) throw await message.fetchLocale(LanguageKeys.Misc.ConfigurationTextChannelRequired);
		const oldLength = await message.guild!.readSettings(GuildSettings.DisabledChannels).then((channels) => channels.length);
		await message.guild!.writeSettings((settings) => {
			const ignoredChannels = settings[GuildSettings.DisabledChannels];
			if (ignoredChannels.includes((channel as TextChannel).id))
				ignoredChannels.splice(ignoredChannels.indexOf((channel as TextChannel).id), 1);
			else ignoredChannels.push((channel as TextChannel).id);

			return settings.getLanguage();
		});

		const newLength = await message.guild!.readSettings(GuildSettings.DisabledChannels).then((channels) => channels.length);
		return message.sendLocale(
			oldLength < newLength ? LanguageKeys.Commands.Management.SetIgnoreChannelsSet : LanguageKeys.Commands.Management.SetIgnoreChannelsRemoved,
			[
				{
					channel: channel.toString()
				}
			]
		);
	}
}
