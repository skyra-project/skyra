import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { isTextBasedChannel } from '@utils/util';
import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_SETIGNORECHANNELS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETIGNORECHANNELS_EXTENDED'),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<here|channel:channelname>'
		});
	}

	public async run(message: KlasaMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		else if (!isTextBasedChannel(channel)) throw message.language.get('CONFIGURATION_TEXTCHANNEL_REQUIRED');
		const oldLength = message.guild!.settings.get(GuildSettings.DisabledChannels).length;
		await message.guild!.settings.update(GuildSettings.DisabledChannels, channel, {
			extraContext: { author: message.author.id }
		});
		const newLength = message.guild!.settings.get(GuildSettings.DisabledChannels).length;
		return message.sendLocale(oldLength < newLength ? 'COMMAND_SETIGNORECHANNELS_SET' : 'COMMAND_SETIGNORECHANNELS_REMOVED', [
			{
				channel: channel.toString()
			}
		]);
	}
}
