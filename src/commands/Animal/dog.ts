import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { fetch, FetchResultTypes, isImageURL } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['doggo', 'puppy'],
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.DogDescription,
	extendedHelp: LanguageKeys.Commands.Animal.DogExtended,
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		const [color, image] = await Promise.all([DbSet.fetchColor(message), this.fetchImage()]);

		return message.send(new MessageEmbed().setColor(color).setImage(image).setTimestamp());
	}

	private async fetchImage() {
		const randomDogData = await fetch<DogResultOk>('https://dog.ceo/api/breeds/image/random', FetchResultTypes.JSON).catch(() => null);
		return randomDogData?.status === 'success' && isImageURL(randomDogData.message) ? randomDogData.message : 'https://i.imgur.com/cF0XUF5.jpg';
	}
}

export interface DogResultOk {
	message: string;
	status: string;
}
