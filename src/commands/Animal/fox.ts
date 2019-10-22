import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch, getColor } from '../../lib/util/util';

const url = new URL('https://randomfox.ca/floof');

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_FOX_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_FOX_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS']
		});
		this.spam = true;
	}

	public async run(message: KlasaMessage) {
		const { image } = await fetch(url, 'json') as FoxResultOk;
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setImage(image)
			.setTimestamp());
	}

}

export interface FoxResultOk {
	image: string;
	link: string;
}
