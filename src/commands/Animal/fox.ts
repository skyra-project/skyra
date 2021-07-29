import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { Message, MessageEmbed } from 'discord.js';
import { URL } from 'url';

const url = new URL('https://randomfox.ca/floof');

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.FoxDescription,
	extendedHelp: LanguageKeys.Commands.Animal.FoxExtended,
	permissions: ['EMBED_LINKS'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message) {
		const { image } = await fetch<FoxResultOk>(url, FetchResultTypes.JSON);
		return message.send(
			new MessageEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setImage(getImageUrl(image) ?? 'https://i.imgur.com/JCtnTv8.png')
				.setTimestamp()
		);
	}
}

export interface FoxResultOk {
	image: string;
	link: string;
}
