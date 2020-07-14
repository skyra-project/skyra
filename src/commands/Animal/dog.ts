import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { fetch, FetchResultTypes, IMAGE_EXTENSION } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage } from 'klasa';

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
			.setColor(await DbSet.fetchColor(message))
			.setTimestamp();

		try {
			const randomDogData = await fetch<DogResultOk>('https://dog.ceo/api/breeds/image/random', FetchResultTypes.JSON);
			if (randomDogData && randomDogData.status === 'success') {
				// Just in case the image is not a valid image url then fallthrough to the catch
				if (!IMAGE_EXTENSION.test(randomDogData.message)) throw '💥';

				embed.setImage(randomDogData.message);
			}
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
