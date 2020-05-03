import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { fetch, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['kitten', 'cat'],
	cooldown: 10,
	description: language => language.tget('COMMAND_KITTY_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_KITTY_EXTENDED'),
	requiredPermissions: ['ATTACH_FILES', 'EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage) {
		const embed = new MessageEmbed()
			.setColor(getColor(message))
			.setTimestamp();

		try {
			const randomImageBuffer = await fetch('https://cataas.com/cat', FetchResultTypes.Buffer);
			embed
				.attachFiles([{ attachment: randomImageBuffer, name: 'randomcat.jpg' }])
				.setImage('attachment://randomcat.jpg');
		} catch {
			embed
				.setImage('https://wallpapercave.com/wp/wp3021105.jpg');
		}
		return message.sendEmbed(embed);
	}

}
