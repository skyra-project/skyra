import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor, getImageUrl } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits, type Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Animal.ShibeDescription,
	detailedDescription: LanguageKeys.Commands.Animal.ShibeExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message) {
		const urls = await fetch<[string]>('https://shibe.online/api/shibes?count=1', FetchResultTypes.JSON);
		const embed = new EmbedBuilder()
			.setColor(getColor(message))
			.setImage(getImageUrl(urls[0]) ?? 'https://i.imgur.com/JJL4ErN.jpg')
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}
