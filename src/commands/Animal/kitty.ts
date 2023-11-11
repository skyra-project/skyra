import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor, getImageUrl } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { Option, Result } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits, type Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['kitten', 'cat'],
	description: LanguageKeys.Commands.Animal.KittyDescription,
	detailedDescription: LanguageKeys.Commands.Animal.KittyExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message) {
		const result = await Result.fromAsync(fetch<AwsRandomCatResult>('https://aws.random.cat/meow', FetchResultTypes.JSON));
		const image = result
			.ok()
			.mapInto((value) => Option.from(getImageUrl(value.file)))
			.unwrapOr('https://wallpapercave.com/wp/wp3021105.jpg');

		const embed = new EmbedBuilder().setColor(getColor(message)).setImage(image).setTimestamp();
		return send(message, { embeds: [embed] });
	}
}

interface AwsRandomCatResult {
	file: string;
}
