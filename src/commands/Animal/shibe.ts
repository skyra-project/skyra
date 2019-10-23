import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { ApplyOptions, fetch, getColor } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: language => language.tget('COMMAND_SHIBE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_SHIBE_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage) {
		const urls = await fetch('https://shibe.online/api/shibes?count=1', 'json') as [string];
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setImage(urls[0])
			.setTimestamp());
	}

}
