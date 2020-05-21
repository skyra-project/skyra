import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { fetch, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 10,
			description: language => language.tget('COMMAND_SHIBE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SHIBE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		const urls = await fetch<[string]>('https://shibe.online/api/shibes?count=1', FetchResultTypes.JSON);
		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message))
			.setImage(urls[0])
			.setTimestamp());
	}

}
