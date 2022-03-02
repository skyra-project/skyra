import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Animal.ShibeDescription,
	detailedDescription: LanguageKeys.Commands.Animal.ShibeExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message) {
		const urls = await fetch<[string]>('https://shibe.online/api/shibes?count=1', FetchResultTypes.JSON);
		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setImage(getImageUrl(urls[0]) ?? 'https://i.imgur.com/JJL4ErN.jpg')
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}
