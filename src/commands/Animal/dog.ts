import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor, getImageUrl } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits, type Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['doggo', 'puppy'],
	description: LanguageKeys.Commands.Animal.DogDescription,
	detailedDescription: LanguageKeys.Commands.Animal.DogExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message) {
		const image = await this.fetchImage();

		const embed = new EmbedBuilder().setColor(getColor(message)).setImage(image!).setTimestamp();
		return send(message, { embeds: [embed] });
	}

	private async fetchImage() {
		const randomDogData = await fetch<DogResultOk>('https://dog.ceo/api/breeds/image/random', FetchResultTypes.JSON).catch(() => null);
		return randomDogData?.status === 'success' ? getImageUrl(randomDogData.message) : 'https://i.imgur.com/cF0XUF5.jpg';
	}
}

export interface DogResultOk {
	message: string;
	status: string;
}
