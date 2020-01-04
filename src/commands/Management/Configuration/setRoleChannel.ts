import { TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { PermissionLevels } from '@lib/types/Enums';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_SETROLECHANNEL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SETROLECHANNEL_EXTENDED'),
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<here|channel:channelname>'
		});
	}

	public async run(message: KlasaMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		else if (channel.type !== 'text') throw message.language.tget('CONFIGURATION_TEXTCHANNEL_REQUIRED');
		if (message.guild!.settings.get(GuildSettings.Channels.Roles) === channel.id) throw message.language.tget('CONFIGURATION_EQUALS');
		await message.guild!.settings.update([[GuildSettings.Channels.Roles, channel], [GuildSettings.Roles.MessageReaction, null]]);
		return message.sendLocale('COMMAND_SETROLECHANNEL_SET', [channel]);
	}

}
