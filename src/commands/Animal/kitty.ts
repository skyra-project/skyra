import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor, getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { fromAsync } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['kitten', 'cat'],
	description: LanguageKeys.Commands.Animal.KittyDescription,
	detailedDescription: LanguageKeys.Commands.Animal.KittyExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message) {
		const result = await fromAsync(fetch<AwsRandomCatResult>('https://aws.random.cat/meow', FetchResultTypes.JSON));
		const embed = new MessageEmbed()
			.setColor(getColor(message))
			.setImage((result.success && getImageUrl(result.value.file)) || 'https://wallpapercave.com/wp/wp3021105.jpg')
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}

interface AwsRandomCatResult {
	file: string;
}
