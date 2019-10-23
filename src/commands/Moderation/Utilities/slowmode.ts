import { TextChannel } from 'discord.js';
import { CommandOptions, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { PermissionLevels } from '../../../lib/types/Enums';
import { ApplyOptions } from '../../../lib/util/util';

@ApplyOptions<CommandOptions>({
	cooldown: 10,
	description: language => language.tget('COMMAND_SLOWMODE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_SLOWMODE_EXTENDED'),
	permissionLevel: PermissionLevels.Administrator,
	requiredPermissions: ['MANAGE_CHANNELS'],
	runIn: ['text'],
	usage: '<reset|cooldown:integer{0,120}>'
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage, [cooldown]: ['reset' | number]) {
		if (cooldown === 'reset') cooldown = 0;
		const channel = message.channel as TextChannel;
		await channel.setRateLimitPerUser(cooldown);
		return message.sendLocale('COMMAND_SLOWMODE_SET', [cooldown]);
	}

}
