import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { safeWrapPromise } from '#utils/common';
import { getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['kitten', 'cat'],
	description: LanguageKeys.Commands.Animal.KittyDescription,
	extendedHelp: LanguageKeys.Commands.Animal.KittyExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message) {
		const result = await safeWrapPromise(fetch<AwsRandomCatResult>('https://aws.random.cat/meow', FetchResultTypes.JSON));
		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setImage((result.success && getImageUrl(result.value.file)) || 'https://wallpapercave.com/wp/wp3021105.jpg')
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}

interface AwsRandomCatResult {
	file: string;
}
