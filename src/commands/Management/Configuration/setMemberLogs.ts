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
			description: language => language.tget('COMMAND_SETMEMBERLOGS_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SETMEMBERLOGS_EXTENDED'),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<here|channel:channelname>'
		});
	}

	public async run(message: KlasaMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		else if (!isTextBasedChannel(channel)) throw message.language.tget('CONFIGURATION_TEXTCHANNEL_REQUIRED');

		const previous = message.guild!.settings.get(GuildSettings.Channels.MemberLogs);
		if (previous === channel.id) throw message.language.tget('CONFIGURATION_EQUALS');
		await message.guild!.settings.update(GuildSettings.Channels.MemberLogs, channel, {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_SETMEMBERLOGS_SET', [channel]);
	}

}
