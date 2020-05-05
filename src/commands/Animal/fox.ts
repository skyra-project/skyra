import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { fetch, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

const url = new URL('https://randomfox.ca/floof');

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_FOX_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_FOX_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		const { image } = await fetch<FoxResultOk>(url, FetchResultTypes.JSON);
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setImage(image)
			.setTimestamp());
	}

}

export interface FoxResultOk {
	image: string;
	link: string;
}
