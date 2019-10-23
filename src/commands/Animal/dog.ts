import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { ApplyOptions, fetch, getColor } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['doggo', 'puppy'],
	cooldown: 10,
	description: language => language.tget('COMMAND_DOG_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_DOG_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage) {
		const embed = new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setTimestamp();

		try {
			const randomDogData = await fetch('https://dog.ceo/api/breeds/image/random', 'json') as DogResultOk;
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
