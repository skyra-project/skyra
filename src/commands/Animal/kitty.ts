import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getColor, fetch } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['kitten', 'cat'],
			cooldown: 10,
			description: language => language.tget('COMMAND_KITTY_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_KITTY_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		const embed = new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setTimestamp();

		try {
			const randomImageBuffer = await fetch('https://cataas.com/cat', 'buffer');
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
