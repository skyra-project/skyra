import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { fetch, FetchResultTypes, getColor } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['doggo', 'puppy'],
			cooldown: 10,
			description: language => language.tget('COMMAND_DOG_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_DOG_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			spam: true
		});
	}

	public async run(message: KlasaMessage) {
		const embed = new MessageEmbed()
			.setColor(getColor(message))
			.setTimestamp();

		try {
			const randomDogData = await fetch<DogResultOk>('https://dog.ceo/api/breeds/image/random', FetchResultTypes.JSON);
			if (randomDogData && randomDogData.status === 'success') embed.setImage(randomDogData.message);
		} catch {
			embed.setImage('https://i.imgur.com/cF0XUF5.jpg');
		}

		return message.sendEmbed(embed);
	}

}

export interface DogResultOk {
	message: string;
	status: string;
}
