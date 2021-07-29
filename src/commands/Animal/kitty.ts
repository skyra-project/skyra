import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { safeWrapPromise } from '#utils/common';
import { getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['kitten', 'cat'],
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.KittyDescription,
	extendedHelp: LanguageKeys.Commands.Animal.KittyExtended,
	permissions: ['ATTACH_FILES', 'EMBED_LINKS'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message) {
		const result = await safeWrapPromise(fetch<AwsRandomCatResult>('https://aws.random.cat/meow', FetchResultTypes.JSON));
		return message.send(
			new MessageEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setImage((result.success && getImageUrl(result.value.file)) || 'https://wallpapercave.com/wp/wp3021105.jpg')
				.setTimestamp()
		);
	}
}

interface AwsRandomCatResult {
	file: string;
}
