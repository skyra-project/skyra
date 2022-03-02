import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';
import { URL } from 'node:url';

const url = new URL('https://randomfox.ca/floof');

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Animal.FoxDescription,
	detailedDescription: LanguageKeys.Commands.Animal.FoxExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message) {
		const { image } = await fetch<FoxResultOk>(url, FetchResultTypes.JSON);
		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setImage(getImageUrl(image) ?? 'https://i.imgur.com/JCtnTv8.png')
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}

export interface FoxResultOk {
	image: string;
	link: string;
}
