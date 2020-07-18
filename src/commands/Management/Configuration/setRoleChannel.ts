import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { isTextBasedChannel } from '@utils/util';
import { TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['src'],
	bucket: 2,
	cooldown: 10,
	description: language => language.tget('COMMAND_SETROLECHANNEL_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_SETROLECHANNEL_EXTENDED'),
	permissionLevel: PermissionLevels.Administrator,
	runIn: ['text'],
	usage: '<here|channel:channelname>'
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		else if (!isTextBasedChannel(channel)) throw message.language.tget('CONFIGURATION_TEXTCHANNEL_REQUIRED');
		if (message.guild!.settings.get(GuildSettings.Channels.Roles) === channel.id) throw message.language.tget('CONFIGURATION_EQUALS');
		await message.guild!.settings.update([[GuildSettings.Channels.Roles, channel], [GuildSettings.Roles.MessageReaction, null]], {
			extraContext: { author: message.author.id }
		});
		return message.sendLocale('COMMAND_SETROLECHANNEL_SET', [channel]);
	}

}
