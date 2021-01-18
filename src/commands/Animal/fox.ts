import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { fetch, FetchResultTypes, getImageUrl } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';

const url = new URL('https://randomfox.ca/floof');

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Animal.FoxDescription,
	extendedHelp: LanguageKeys.Commands.Animal.FoxExtended,
	requiredPermissions: ['EMBED_LINKS'],
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		const { image } = await fetch<FoxResultOk>(url, FetchResultTypes.JSON);
		return message.send(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setImage(getImageUrl(image) ?? 'https://i.imgur.com/JCtnTv8.png')
				.setTimestamp()
		);
	}
}

export interface FoxResultOk {
	image: string;
	link: string;
}
