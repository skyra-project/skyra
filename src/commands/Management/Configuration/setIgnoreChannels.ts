import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { isTextBasedChannel } from '@utils/util';
import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('commandSetIgnoreChannelsDescription'),
			extendedHelp: (language) => language.get('commandSetIgnoreChannelsExtended'),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<here|channel:channelname>'
		});
	}

	public async run(message: KlasaMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		else if (!isTextBasedChannel(channel)) throw message.language.get('configurationTextChannelRequired');
		const oldLength = message.guild!.settings.get(GuildSettings.DisabledChannels).length;
		await message.guild!.settings.update(GuildSettings.DisabledChannels, channel, {
			extraContext: { author: message.author.id }
		});
		const newLength = message.guild!.settings.get(GuildSettings.DisabledChannels).length;
		return message.sendLocale(oldLength < newLength ? 'commandSetIgnoreChannelsSet' : 'commandSetIgnoreChannelsRemoved', [
			{
				channel: channel.toString()
			}
		]);
	}
}
