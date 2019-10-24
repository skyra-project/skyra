import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { fetch, getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['chucknorris'],
			cooldown: 10,
			description: language => language.tget('COMMAND_NORRIS_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_NORRIS_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		const data = await fetch('https://api.chucknorris.io/jokes/random', 'json') as NorrisResultOk;
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setTitle(message.language.tget('COMMAND_NORRIS_OUTPUT'))
			.setURL(data.url)
			.setThumbnail(data.icon_url)
			.setDescription(data.value));
	}

}

export interface NorrisResultOk {
	categories: string[];
	created_at: Date;
	icon_url: string;
	id: string;
	updated_at: Date;
	url: string;
	value: string;
}
