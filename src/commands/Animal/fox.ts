import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor, getImageUrl } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits, type Message } from 'discord.js';

const url = new URL('https://randomfox.ca/floof');

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Animal.FoxDescription,
	detailedDescription: LanguageKeys.Commands.Animal.FoxExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message) {
		const { image } = await fetch<FoxResultOk>(url, FetchResultTypes.JSON);
		const embed = new EmbedBuilder()
			.setColor(getColor(message))
			.setImage(getImageUrl(image) ?? 'https://i.imgur.com/JCtnTv8.png')
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}

export interface FoxResultOk {
	image: string;
	link: string;
}
