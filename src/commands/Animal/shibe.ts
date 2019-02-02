import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			cooldown: 10,
			description: (language) => language.get('COMMAND_SHIBE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SHIBE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		const urls = await fetch('http://shibe.online/api/shibes?count=1', 'json');
		return message.sendEmbed(new MessageEmbed()
			.setColor(0xFFE0B2)
			.setImage(urls[0]));
	}

}
