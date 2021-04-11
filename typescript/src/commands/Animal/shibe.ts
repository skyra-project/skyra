import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetch, FetchResultTypes, getImageUrl } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.ShibeDescription,
	extendedHelp: LanguageKeys.Commands.Animal.ShibeExtended,
	permissions: ['EMBED_LINKS'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message) {
		const urls = await fetch<[string]>('https://shibe.online/api/shibes?count=1', FetchResultTypes.JSON);
		return message.send(
			new MessageEmbed()
				.setColor(await this.context.db.fetchColor(message))
				.setImage(getImageUrl(urls[0]) ?? 'https://i.imgur.com/JJL4ErN.jpg')
				.setTimestamp()
		);
	}
}
