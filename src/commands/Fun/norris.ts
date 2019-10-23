import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { ApplyOptions, fetch, getColor } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['chucknorris'],
	cooldown: 10,
	description: language => language.tget('COMMAND_NORRIS_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_NORRIS_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage) {
		const data = await fetch('https://api.chucknorris.io/jokes/random', 'json') as NorrisResultOk;
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
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
