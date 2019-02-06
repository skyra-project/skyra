import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { URL } from 'url';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch } from '../../lib/util/util';

const url = new URL('https://randomfox.ca/floof');

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_FOX_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_FOX_EXTENDED')
		});
		this.spam = true;
	}

	public async run(message: KlasaMessage) {
		const { image } = await fetch(url, 'json');
		return message.sendEmbed(new MessageEmbed()
			.setColor((message.member && message.member.roles.color.color) || 0xFFAB2D)
			.setImage(image)
			.setTimestamp());
	}

}
