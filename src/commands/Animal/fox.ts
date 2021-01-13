import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageEmbed } from 'discord.js';

const url = new URL('https://randomfox.ca/floof');

@ApplyOptions<SkyraCommandOptions>({
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
				.setImage(image)
				.setTimestamp()
		);
	}
}

export interface FoxResultOk {
	image: string;
	link: string;
}
